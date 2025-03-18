import pytest
from expert_matcher.services.ai.differentiation_service import _prompt_factory, generate_differentiation_questions
from tests.integration.provider import provide_dummy_data

def test_prompt_factory():
    prompt = _prompt_factory()
    assert prompt is not None
    assert len(prompt.messages) == 2
    assert prompt.messages[0].prompt.template is not None
    assert prompt.messages[1].prompt.template is not None


@pytest.mark.asyncio
async def test_generate_differentiation_questions():
    """Test filtering consultants based on the session state."""
    session_id = "1234"
    await provide_dummy_data(session_id)
    questions = await generate_differentiation_questions(session_id)
    assert questions is not None
    assert len(questions.questions) > 0

