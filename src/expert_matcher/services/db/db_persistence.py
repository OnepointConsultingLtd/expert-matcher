from typing import Awaitable

from psycopg import AsyncCursor

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.model.state import State
from expert_matcher.services.db.db_support import select_from, create_cursor
from expert_matcher.model.consultant import Consultant


async def select_first_question() -> QuestionSuggestions | None:
    """Select the first question with its suggestions."""

    sql = """
SELECT C.ID CATEGORY_ID, C.NAME CATEGORY, Q.question, Q.id question_id FROM TB_CATEGORY_QUESTION Q 
INNER JOIN TB_CATEGORY C ON C.ID = Q.CATEGORY_ID 
WHERE ACTIVE is true
ORDER BY ORDER_INDEX LIMIT 1;
"""
    res = await select_from(sql, {})
    if len(res) == 0:
        return None
    category_pos = 0
    category = 1
    question = 2
    question_id = 3
    category_id = res[0][category_pos]
    question_suggestions = QuestionSuggestions(
        id=res[0][question_id],
        category=res[0][category],
        question=res[0][question],
        suggestions=[],
    )
    sql_suggestions = """
SELECT ITEM FROM TB_CATEGORY_ITEM WHERE CATEGORY_ID = %(category_id)s;
"""
    res_suggestions = await select_from(sql_suggestions, {"category_id": category_id})
    for suggestion in res_suggestions:
        question_suggestions.suggestions.append(suggestion[0])
    return question_suggestions


async def save_session_question(session_id: str, question_id: int) -> int:
    """Save the session question to the database."""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        sql = """
INSERT INTO TB_SESSION_QUESTION(SESSION_ID, CATEGORY_QUESTION_ID)
VALUES((SELECT ID FROM TB_SESSION WHERE SESSION_ID = %(session_id)s), %(question_id)s)
ON CONFLICT(SESSION_ID, CATEGORY_QUESTION_ID) DO NOTHING
"""
        await cur.execute(sql, {"session_id": session_id, "question_id": question_id})
        return cur.rowcount
    
    return await create_cursor(process)


async def delete_session_question(session_id: str, question_id: int) -> int:
    """Delete the session question from the database."""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        sql = """
DELETE FROM TB_SESSION_QUESTION 
WHERE SESSION_ID = (SELECT ID FROM TB_SESSION WHERE SESSION_ID = %(session_id)s) AND CATEGORY_QUESTION_ID = %(question_id)s;
"""
        await cur.execute(sql, {"session_id": session_id, "question_id": question_id})
        return cur.rowcount

    return await create_cursor(process)


async def save_session(session: Session) -> int:
    """Save the session to the database."""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        sql = """
INSERT INTO TB_SESSION (SESSION_ID, USER_EMAIL) VALUES (%(session_id)s, %(email)s);
"""
        await cur.execute(sql, session.model_dump())
        return cur.rowcount

    return await create_cursor(process)


async def delete_session(session_id: str) -> int:
    """Delete the session from the database."""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        sql = """
DELETE FROM TB_SESSION WHERE SESSION_ID = %(session_id)s;
"""
        await cur.execute(sql, {"session_id": session_id})
        return cur.rowcount

    return await create_cursor(process)


async def get_session_state(session_id: str) -> State:
    """Get the session state from the database."""

    async def process(cur: AsyncCursor) -> Awaitable[State]:
        sql = """
-- select categories and questions
select cq.id, c.NAME, cq.QUESTION from TB_SESSION_QUESTION sq 
INNER JOIN TB_SESSION s on s.id = sq.SESSION_ID
INNER JOIN TB_CATEGORY_QUESTION cq on cq.ID = sq.CATEGORY_QUESTION_ID
INNER JOIN TB_CATEGORY c on c.ID = cq.CATEGORY_ID
WHERE s.session_id = %(session_id)s;
"""
        suggestions_sql = """
-- select suggestions (category items) for session and question
select ci.ITEM from TB_CATEGORY_ITEM ci 
INNER JOIN TB_CATEGORY c on c.ID = ci.CATEGORY_ID
INNER JOIN TB_CATEGORY_QUESTION cq on cq.CATEGORY_ID = c.ID
INNER JOIN TB_SESSION_QUESTION sq on sq.CATEGORY_QUESTION_ID = cq.ID
INNER JOIN TB_SESSION s on s.id = sq.SESSION_ID
WHERE s.session_id = %(session_id)s and cq.ID = %(question_id)s;
"""
        selected_suggestions_sql = """
-- select selected suggestions (category items) for session and question
select ci.ITEM from TB_SESSION_QUESTION_RESPONSES r
inner join TB_SESSION_QUESTION sq on sq.ID = r.SESSION_QUESTION_ID
inner join TB_SESSION s on s.ID = sq.SESSION_ID
inner join TB_CATEGORY_ITEM ci on ci.ID = r.CATEGORY_ITEM_ID
INNER JOIN TB_CATEGORY c on c.ID = ci.CATEGORY_ID
INNER JOIN TB_CATEGORY_QUESTION cq on cq.CATEGORY_ID = c.ID
WHERE s.session_id = %(session_id)s and cq.ID = %(question_id)s;
"""
        await cur.execute(sql, {"session_id": session_id})
        question_rows = await cur.fetchall()
        question_id_index = 0
        category_index = 1
        question_index = 2
        history: list[QuestionSuggestions] = []
        for question_row in question_rows:
            question_id = question_row[question_id_index]
            category = question_row[category_index]
            question = question_row[question_index]
            await cur.execute(suggestions_sql, {"session_id": session_id, "question_id": question_id})
            suggestions = await cur.fetchall()
            await cur.execute(selected_suggestions_sql, {"session_id": session_id, "question_id": question_id})
            selected_suggestions = await cur.fetchall()
            question_suggestions = QuestionSuggestions(
                id=question_id,
                category=category,
                question=question,
                suggestions=[s[0] for s in suggestions],
                selected_suggestions=[s[0] for s in selected_suggestions],
            )
            history.append(question_suggestions)
        return State(session_id=session_id, history=history)

    return await create_cursor(process)


async def filter_consultants(session_id: str) -> list[Consultant]:
    """Filter the consultants based on the session state."""
    async def processor(cur: AsyncCursor) -> Awaitable[list[Consultant]]:
        sql = """
-- select categories that has already been picked up in a session
select cq.order_index, c.NAME, STRING_AGG(ci.ITEM, '@@') CATEGORY_ITEMS from TB_SESSION s
INNER JOIN TB_SESSION_QUESTION sq ON sq.SESSION_ID = s.ID
INNER JOIN TB_CATEGORY_QUESTION cq ON cq.ID = sq.CATEGORY_QUESTION_ID
INNER JOIN TB_CATEGORY c ON c.ID = cq.CATEGORY_ID
INNER JOIN TB_SESSION_QUESTION_RESPONSES r ON r.SESSION_QUESTION_ID = sq.id
INNER JOIN TB_CATEGORY_ITEM ci ON ci.ID = r.CATEGORY_ITEM_ID
WHERE s.SESSION_ID = %(session_id)s group by cq.order_index, c.NAME order by cq.order_index
"""
        consultant_sql_template_initial = """
select distinct CONSULTANT_ID from VW_CONSULTANT_CATEGORY_ITEM
WHERE CATEGORY_NAME = %(category_name)s AND CATEGORY_ITEM = ANY(%(category_items)s)
"""
        consultant_sql_template = """
select distinct CONSULTANT_ID from VW_CONSULTANT_CATEGORY_ITEM
WHERE CATEGORY_NAME = %(category_name)s AND CATEGORY_ITEM = ANY(%(category_items)s)
AND CONSULTANT_ID = ANY(%(consultant_ids)s)
"""
        consultant_details_sql = """
select ID, GIVEN_NAME, SURNAME, LINKEDIN_PROFILE_URL from TB_CONSULTANT
where ID = ANY(%(consultant_ids)s)
"""
        categories_with_items = await select_from(sql, {"session_id": session_id})
        category_name_index = 1
        category_items_index = 2
        consultant_ids = []
        for index, category in enumerate(categories_with_items):
            category_name = category[category_name_index]
            category_items = category[category_items_index].split('@@')
            if index == 0:
                consultant_id_rows = await select_from(consultant_sql_template_initial, 
                                {"category_name": category_name, "category_items": category_items})
                consultant_ids = [c[0] for c in consultant_id_rows]
            else:
                consultant_id_rows = await select_from(consultant_sql_template, 
                                {"category_name": category_name, "category_items": category_items, "consultant_ids": consultant_ids})
                consultant_ids = [c[0] for c in consultant_id_rows]
        consultant_details = await select_from(consultant_details_sql, {"consultant_ids": consultant_ids})
        consultant_id_index = 0
        given_name_index = 1
        surname_index = 2
        linkedin_profile_url_index = 3
        consultants: list[Consultant] = []
        for consultant_detail in consultant_details:
            consultant = Consultant(
                id=consultant_detail[consultant_id_index],
                given_name=consultant_detail[given_name_index],
                surname=consultant_detail[surname_index],
                linkedin_profile_url=consultant_detail[linkedin_profile_url_index]
            )
            consultants.append(consultant)
        return consultants

    return await create_cursor(processor)

async def execute_script(script: str) -> State:
    async def process(cur: AsyncCursor) -> Awaitable[None]:
        await cur.execute(script)
        return None

    return await create_cursor(process)
