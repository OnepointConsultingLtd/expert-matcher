from typing import Awaitable

from psycopg import AsyncCursor

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.services.db.db_support import select_from, create_cursor


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
