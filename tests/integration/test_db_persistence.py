import pytest

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.services.db.db_persistence import (
    select_first_question,
    save_session,
    delete_session,
    save_session_question,
    delete_session_question,
    execute_script,
    get_session_state,
    find_available_consultants,
    select_next_question
)


async def get_first_question() -> QuestionSuggestions:
    """Test selecting the first question with its suggestions."""
    result = await select_first_question('')

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


async def provide_dummy_data(session_id: str):
    # Create dummy data
    await execute_script(f"""
delete from tb_session where session_id = '{session_id}';
                         
insert into tb_session(session_id, user_email) values('{session_id}', 'anon@test.com');

insert into TB_SESSION_QUESTION(SESSION_ID, CATEGORY_QUESTION_ID)
values((select id from TB_SESSION where SESSION_ID='{session_id}'), (select id from TB_CATEGORY_QUESTION order by order_index limit 1));

insert into TB_SESSION_QUESTION(SESSION_ID, CATEGORY_QUESTION_ID)
values((select id from TB_SESSION where SESSION_ID='{session_id}'), 
(select id from TB_CATEGORY_QUESTION order by order_index offset 1 limit 1));

insert into TB_SESSION_QUESTION_RESPONSES(SESSION_QUESTION_ID, CATEGORY_ITEM_ID)
values((select sq.id from TB_SESSION_QUESTION sq
where SESSION_ID = ((select id from TB_SESSION where SESSION_ID='{session_id}')) 
and CATEGORY_QUESTION_ID = (select id from TB_CATEGORY_QUESTION order by order_index limit 1)), 
(select id from TB_CATEGORY_ITEM where category_id = (select C.id from TB_CATEGORY C 
INNER JOIN TB_CATEGORY_QUESTION q on C.id = q.CATEGORY_ID
WHERE q.id = (select id from TB_CATEGORY_QUESTION order by order_index limit 1)) limit 1));

insert into TB_SESSION_QUESTION_RESPONSES(SESSION_QUESTION_ID, CATEGORY_ITEM_ID)
values((select sq.id from TB_SESSION_QUESTION sq
where SESSION_ID = ((select id from TB_SESSION where SESSION_ID='{session_id}')) 
and CATEGORY_QUESTION_ID = (select id from TB_CATEGORY_QUESTION order by order_index offset 1 limit 1)), 
(select id from TB_CATEGORY_ITEM where category_id = (select C.id from TB_CATEGORY C 
INNER JOIN TB_CATEGORY_QUESTION q on C.id = q.CATEGORY_ID
WHERE q.id = (select id from TB_CATEGORY_QUESTION order by order_index offset 1 limit 1)) limit 1));

insert into TB_SESSION_QUESTION_RESPONSES(SESSION_QUESTION_ID, CATEGORY_ITEM_ID)
values((select sq.id from TB_SESSION_QUESTION sq
where SESSION_ID = ((select id from TB_SESSION where SESSION_ID='{session_id}')) 
and CATEGORY_QUESTION_ID = (select id from TB_CATEGORY_QUESTION order by order_index offset 1 limit 1)), 
(select id from TB_CATEGORY_ITEM where category_id = (select C.id from TB_CATEGORY C 
INNER JOIN TB_CATEGORY_QUESTION q on C.id = q.CATEGORY_ID
WHERE q.id = (select id from TB_CATEGORY_QUESTION order by order_index offset 1 limit 1)) offset 1 limit 1));

""")


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
    question_suggestions = await select_next_question(session_id)
    assert question_suggestions is not None
    assert question_suggestions.id is not None
    assert question_suggestions.category is not None
    assert question_suggestions.question is not None
    assert question_suggestions.suggestions is not None
    assert len(question_suggestions.suggestions) > 0