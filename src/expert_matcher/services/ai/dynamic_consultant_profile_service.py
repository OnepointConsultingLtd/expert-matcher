from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence

from expert_matcher.services.ai.prompt_factory_support import prompt_factory
from expert_matcher.model.dynamic_consultant_profile import DynamicConsultantProfile
from expert_matcher.services.db.db_persistence import find_dynamic_consultant_profile
from expert_matcher.model.dynamic_consultant_profile import (
    DynamicConsultantProfileResponse,
)
from expert_matcher.config.config import cfg

def _prompt_factory() -> ChatPromptTemplate:
    """Create a prompt template for a specific key"""
    return prompt_factory("dynamic_user_profile")


def _chain_factory() -> RunnableSequence:
    """Create a chain of functions to extract dimensions from a text"""
    model = cfg.llm.with_structured_output(DynamicConsultantProfile)
    prompt = _prompt_factory()
    return prompt | model


async def generate_dynamic_consultant_profile(
    session_id: str, email: str
) -> DynamicConsultantProfile | None:
    dynamic_consultant_profile_response = (
        await find_dynamic_consultant_profile(session_id, email)
    )
    if not dynamic_consultant_profile_response:
        return None
    return await generate_dynamic_consultant_profile_from_db(dynamic_consultant_profile_response)

    
async def generate_dynamic_consultant_profile_from_db(
    dynamic_consultant_profile_response: DynamicConsultantProfileResponse
) -> DynamicConsultantProfile:
    
    question_answers_str = "\n".join([str(qa) for qa in dynamic_consultant_profile_response.question_answers])
    differentiation_question_answers_str = "\n".join(
        [str(qa) for qa in dynamic_consultant_profile_response.differentiation_question_answers]
    )
    consultant_details_str = str(dynamic_consultant_profile_response.consultant)

    return await execute_chain(
        _chain_factory(),
        question_answers_str,
        differentiation_question_answers_str,
        consultant_details_str,
    )


async def execute_chain(
    chain: RunnableSequence,
    question_answers_str: str,
    differentiation_question_answers_str: str,
    consultant_details_str: str,
) -> DynamicConsultantProfile:
    chain = _chain_factory()
    return await chain.ainvoke(
        {
            "pre_defined_questions_and_answers": question_answers_str,
            "dynamic_questions_and_answers": differentiation_question_answers_str,
            "original_profile": consultant_details_str,
        }
    )
