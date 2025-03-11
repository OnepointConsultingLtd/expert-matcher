import pytest

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.services.db.db_persistence import select_first_question, save_session, delete_session


@pytest.mark.asyncio
async def test_select_first_question():
    """Test selecting the first question with its suggestions."""
    result = await select_first_question()

    assert result is not None
    assert isinstance(result, QuestionSuggestions)
    assert result.category is not None
    assert result.question is not None
    assert result.suggestions is not None
    assert len(result.suggestions) > 0


@pytest.fixture
async def test_session():
    """Fixture to create and cleanup a test session."""
    session = Session(session_id="123", email="test@test.com")
    await save_session(session)
    yield session
    await delete_session(session.session_id)


@pytest.mark.asyncio
async def test_save_session(test_session):
    """Test saving a session to the database."""
    assert test_session is not None
    async for item in test_session:
        assert item.session_id == "123"
        assert item.email == "test@test.com"

