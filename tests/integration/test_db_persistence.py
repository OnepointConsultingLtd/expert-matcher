import pytest

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.model.ws_commands import ClientResponse
from expert_matcher.services.db.db_persistence import (
    select_first_question,
    save_session,
    delete_session,
    save_session_question,
    delete_session_question,
    get_session_state,
    find_available_consultants,
    select_next_question,
    session_exists,
    save_client_response,
    save_session_question_as_str,
    get_configuration,
    get_configuration_value
)
from tests.integration.provider import provide_dummy_data, provide_initial_question

async def get_first_question() -> QuestionSuggestions:
    """Test selecting the first question with its suggestions."""
    result = await select_first_question("")

    assert result is not None
    assert isinstance(result, QuestionSuggestions)
    assert result.category is not None
    assert result.question is not None
    assert result.suggestions is not None
    assert len(result.suggestions) > 0
    return result


async def get_session() -> Session:
    session = Session(session_id="123", email="test@test.com")
    await delete_session(session.session_id)
    await save_session(session)
    return session


@pytest.mark.asyncio
async def test_select_first_question():
    await get_first_question()


@pytest.mark.asyncio
async def test_save_session_question():
    """Test saving a session question to the database."""
    first_question = await get_first_question()
    session = await get_session()
    updated = await save_session_question(
        session_id=session.session_id, question_id=first_question.id
    )
    deleted = await delete_session_question(
        session_id=session.session_id, question_id=first_question.id
    )
    assert updated == 1
    assert deleted == 1


@pytest.fixture
async def test_session():
    """Fixture to create and cleanup a test session."""
    session = await get_session()
    yield session
    await delete_session(session.session_id)


@pytest.mark.asyncio
async def test_save_session(test_session):
    """Test saving a session to the database."""
    assert test_session is not None
    async for item in test_session:
        assert item.session_id == "123"
        assert item.email == "test@test.com"





@pytest.mark.asyncio
async def test_get_session_state():
    """Test getting the session state from the database."""

    session_id = "1234"
    await provide_dummy_data(session_id)

    state = await get_session_state(session_id)
    assert state is not None
    assert state.session_id == session_id
    assert state.history is not None
    assert len(state.history) == 2


@pytest.mark.asyncio
async def test_filter_consultants_on_unexisting_session():
    """Test filtering consultants based on the session state."""
    session_id = "1234567"

    consultants = await find_available_consultants(session_id)
    assert consultants is not None


@pytest.mark.asyncio
async def test_filter_consultants():
    """Test filtering consultants based on the session state."""
    session_id = "1234"
    await provide_dummy_data(session_id)

    consultants = await find_available_consultants(session_id)
    assert consultants is not None
    # assert len(consultants) > 0


@pytest.mark.asyncio
async def test_select_next_question():
    session_id = "1234"
    await provide_dummy_data(session_id)
    assert await session_exists(session_id)
    question_suggestions = await select_next_question(session_id)
    assert question_suggestions is not None
    assert question_suggestions.id is not None
    assert question_suggestions.category is not None
    assert question_suggestions.question is not None
    assert question_suggestions.suggestions is not None
    # assert len(question_suggestions.suggestions) > 0


@pytest.mark.asyncio
async def test_save_client_response():
    session_id = "12345"
    await provide_initial_question(session_id)
    next_question = await select_next_question(session_id)
    assert next_question is not None
    assert next_question.id is not None
    assert next_question.category is not None
    question = next_question.question
    suggestions = next_question.suggestions
    assert question is not None
    assert suggestions is not None
    updated = await save_session_question_as_str(session_id, question)
    assert updated > 0
    # assert len(next_question.suggestions) > 0
    client_response = ClientResponse(session_id=session_id, question=question, response_items=suggestions)
    updated = await save_client_response(session_id, client_response)  
    assert updated > 0


@pytest.mark.asyncio
async def test_get_configuration():
    config = await get_configuration()
    assert config is not None
    assert config.config is not None
    assert len(config.config) > 0
    for key, value in config.config.items():
        value = await get_configuration_value(key)
        assert value is not None

