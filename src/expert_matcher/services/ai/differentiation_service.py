from langchain_core.prompts import (
    PromptTemplate,
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.runnables import RunnableSequence

from expert_matcher.config.config import cfg
from expert_matcher.model.differentiation_questions import DifferentiationQuestions
from expert_matcher.model.consultant import Consultant
from expert_matcher.services.db.db_persistence import (
    get_session_state,
    find_available_consultants,
)


def _prompt_factory() -> PromptTemplate:
    """Create a prompt template for a specific key"""
    prompt_dimensions = cfg.prompt_templates["differentiation_questions"]
    human_message = prompt_dimensions["human_message"]
    system_message = prompt_dimensions["system_message"]
    return ChatPromptTemplate(
        messages=[
            SystemMessagePromptTemplate(prompt=PromptTemplate(template=system_message)),
            HumanMessagePromptTemplate(prompt=PromptTemplate(template=human_message)),
        ]
    )


def _chain_factory() -> RunnableSequence:
    """Create a chain of functions to extract dimensions from a text"""
    model = cfg.selected_llm.with_structured_output(DifferentiationQuestions)
    prompt = _prompt_factory()
    return prompt | model


def _prepare_input(candidates: list[Consultant], excluded_dimensions: list[str]) -> str:
    """Prepare the input for the chain"""
    candidates_str = ""
    for c in candidates:
        candidates_str += f"""ID: {c.id}
Name: {c.given_name} {c.surname}
LinkedIn: {c.linkedin_profile_url}
Email: {c.email}

"""
    excluded_dimensions_str = "\n- ".join(excluded_dimensions)
    return {
        "candidates": candidates_str,
        "excluded_dimensions": excluded_dimensions_str,
    }


async def _generate_differentiation_questions(
    candidates: list[Consultant], excluded_dimensions: list[str]
) -> DifferentiationQuestions:
    """Generate differentiation questions"""
    chain = _chain_factory()
    input = _prepare_input(candidates, excluded_dimensions)
    return await chain.invoke(input)


async def generate_differentiation_questions(session_id: str) -> DifferentiationQuestions:
    """Generate differentiation questions"""
    session_state = await get_session_state(session_id)
    candidates = await find_available_consultants(session_id)
    excluded_dimensions = [q.category for q in session_state.history]
    return await _generate_differentiation_questions(candidates, excluded_dimensions)
