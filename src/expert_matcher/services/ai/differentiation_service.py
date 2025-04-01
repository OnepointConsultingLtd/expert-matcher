from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence

from expert_matcher.config.config import cfg
from expert_matcher.model.differentiation_questions import (
    DifferentiationQuestions,
    DifferentiationQuestionsResponse,
)
from expert_matcher.model.consultant import Consultant
from expert_matcher.services.db.db_persistence import (
    get_session_state,
    find_available_consultants,
    read_differentiation_question,
    save_differentiation_question,
    get_configuration_value,
)
from expert_matcher.services.ai.prompt_factory_support import prompt_factory


def _prompt_factory() -> ChatPromptTemplate:
    """Create a prompt template for a specific key"""
    return prompt_factory("differentiation_questions")


def _chain_factory() -> RunnableSequence:
    """Create a chain of functions to extract dimensions from a text"""
    model = cfg.llm.with_structured_output(DifferentiationQuestions)
    prompt = _prompt_factory()
    return prompt | model


async def _prepare_input(
    candidates: list[Consultant], excluded_dimensions: list[str]
) -> str:
    """Prepare the input for the chain"""
    candidates_str = ""
    for c in candidates:
        skills_str = "\n-".join(c.skills)
        experiences_str = "\n-".join([str(e) for e in c.experiences])
        candidates_str += f"""ID: {c.id}
Name: {c.given_name} {c.surname}
LinkedIn: {c.linkedin_profile_url}
Email: {c.email}
CV: {c.cv}
Skills: {skills_str}
Experiences: {experiences_str}

"""
    min_questions = await get_configuration_value("min_questions", "10")
    excluded_dimensions_str = "\n- ".join(excluded_dimensions)
    return {
        "candidates": candidates_str,
        "excluded_dimensions": excluded_dimensions_str,
        "min_questions": min_questions,
    }


async def _generate_differentiation_questions(
    candidates: list[Consultant], excluded_dimensions: list[str]
) -> DifferentiationQuestions:
    """Generate differentiation questions"""
    chain = _chain_factory()
    input = await _prepare_input(candidates, excluded_dimensions)
    return await chain.ainvoke(input)


async def generate_differentiation_questions(
    session_id: str,
) -> DifferentiationQuestionsResponse:
    """Generate differentiation questions"""
    session_state = await get_session_state(session_id)
    candidates = await find_available_consultants(session_id, True)
    excluded_dimensions = [q.category for q in session_state.history]
    questions = await _generate_differentiation_questions(
        candidates, excluded_dimensions
    )
    for question in questions.questions:
        question.options = [
            option for option in question.options if len(option.consultants) > 0
        ]
    return DifferentiationQuestionsResponse(
        questions=questions.questions,
        candidates=candidates,
    )


async def fetch_differentiation_questions(
    session_id: str,
) -> DifferentiationQuestionsResponse:
    """Either read existing questions or generate new ones and save them"""
    response = await read_differentiation_question(session_id)
    if response:
        (cfg.base_folder / "docs/sample_differentiation_questions.json").write_text(
            response.model_dump_json()
        )
        return response
    response = await generate_differentiation_questions(session_id)
    response.candidates = await find_available_consultants(session_id)
    await save_differentiation_question(session_id, response)
    response.questions = sorted(response.questions, key=lambda x: x.question)
    return response
