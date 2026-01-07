from expert_matcher.services.ai.differentiation_service import (
    DifferentiationQuestionsResponse,
)
from expert_matcher.services.pdf.candidate_report import (
    render_candidate_report,
    REPORT_TITLE,
    generate_pdf,
    calculate_votes,
)
from tests.integration.provider import provide_differentiation_questions
import pytest


@pytest.mark.skip
def test_render_candidate_report():
    differentiation_questions = provide_differentiation_questions()
    consultants_with_votes = calculate_votes(differentiation_questions)
    differentiation_questions.candidates = consultants_with_votes
    html = render_candidate_report(differentiation_questions)
    assert html is not None
    assert len(html) > 0
    assert REPORT_TITLE in html


@pytest.mark.skip
def test_generate_pdf():
    differentiation_questions = provide_differentiation_questions()
    pdf = generate_pdf(differentiation_questions, "123")
    assert pdf is not None
    assert pdf.exists()
