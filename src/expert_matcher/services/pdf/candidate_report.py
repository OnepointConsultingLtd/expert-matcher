import jinja2
from pathlib import Path

import pdfkit

from expert_matcher.config.config import cfg
from expert_matcher.services.db.db_persistence import read_differentiation_question
from expert_matcher.services.ai.differentiation_service import (
    DifferentiationQuestionsResponse,
)
from expert_matcher.model.consultant import ConsultantWithVotes, VotedOn

PDF_PATH = cfg.base_folder / "reports/pdf"
if not PDF_PATH.exists():
    PDF_PATH.mkdir(parents=True, exist_ok=True)


REPORT_TITLE = "Onpoint Expert Match Report"


async def generate_candidate_report(session_id: str) -> Path:
    response: DifferentiationQuestionsResponse | None = (
        await read_differentiation_question(session_id)
    )
    if not response:
        raise ValueError("No differentiation questions found")
    return generate_pdf(response, session_id)


def calculate_votes(
    response: DifferentiationQuestionsResponse,
) -> list[ConsultantWithVotes]:
    consultants_dict = {
        c.email: ConsultantWithVotes(
            id=c.id,
            given_name=c.given_name,
            surname=c.surname,
            email=c.email,
            linkedin_profile_url=c.linkedin_profile_url,
            cv=c.cv,
            skills=c.skills,
            experiences=c.experiences,
            cv_summary=c.cv_summary,
            votes=0,
        )
        for c in response.candidates
    }
    for question in response.questions:
        for option in question.options:
            if option.selected:
                for consultant in option.consultants:
                    consultants_dict[consultant].votes += 1
                    consultants_dict[consultant].voted_on[question.question].append(
                        VotedOn(
                            question=question.question,
                            dimension=question.dimension,
                            option=option.option,
                        )
                    )
    consultants_with_votes = list(consultants_dict.values())
    consultants_with_votes.sort(key=lambda x: x.votes, reverse=True)
    return consultants_with_votes


def generate_pdf(response: DifferentiationQuestionsResponse, session_id: str) -> Path:
    consultants_with_votes = calculate_votes(response)
    response.candidates = consultants_with_votes
    html = render_candidate_report(response)
    target_file = PDF_PATH / f"report_{session_id}.pdf"
    config = pdfkit.configuration(wkhtmltopdf=cfg.wkhtmltopdf_binary.as_posix())
    pdfkit.from_string(
        html,
        target_file.as_posix(),
        configuration=config,
        options={"enable-local-file-access": ""},
    )
    return target_file


def render_candidate_report(response: DifferentiationQuestionsResponse) -> str:
    banner_path = (
        (cfg.base_folder / "expert-matcher-ui/public/images/expertmatcher-black.png")
        .absolute()
        .as_uri()
    )
    context = {
        "title": REPORT_TITLE,
        "differentiation_questions": response.questions,
        "candidates": response.candidates,
        "banner": banner_path,
    }
    template_loader = jinja2.FileSystemLoader(cfg.base_folder / "templates")
    template_env = jinja2.Environment(loader=template_loader)
    candidate_report_template = template_env.get_template("candidate_report.html")
    return candidate_report_template.render(context)
