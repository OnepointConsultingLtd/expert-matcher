from typing import Awaitable

from psycopg import AsyncCursor

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.model.state import State
from expert_matcher.model.configuraton import Configuration
from expert_matcher.services.db.db_support import select_from, create_cursor
from expert_matcher.model.consultant import Consultant
from expert_matcher.model.ws_commands import ClientResponse
from expert_matcher.config.logger import logger


async def select_first_question(session_id: str) -> QuestionSuggestions | None:
    """Select the first question with its suggestions."""
    return await select_next_question(session_id)


async def select_next_question(session_id: str) -> QuestionSuggestions | None:
    """Select the next question with its suggestions."""

    sql = """
SELECT C.ID CATEGORY_ID, C.NAME CATEGORY, Q.question, Q.id question_id from TB_CATEGORY_QUESTION Q
INNER JOIN TB_CATEGORY C ON C.ID = Q.CATEGORY_ID
WHERE ACTIVE is true
ORDER BY order_index offset (SELECT count(*) + 1 FROM TB_SESSION_QUESTION sq
INNER JOIN TB_SESSION s on s.id = sq.session_id
WHERE s.session_id = %(session_id)s and sq.id in (SELECT SESSION_QUESTION_ID FROM TB_SESSION_QUESTION_RESPONSES)) LIMIT 1
"""
    res = await select_from(sql, {"session_id": session_id})
    if len(res) == 0:
        return None
    category = 1
    question = 2
    question_id = 3
    question_suggestions = QuestionSuggestions(
        id=res[0][question_id],
        category=res[0][category],
        question=res[0][question],
        suggestions=[],
        suggestions_count=[],
        available_consultants_count=-1,
    )
    consultants = await find_available_consultants(session_id)
    consultant_ids = [c.id for c in consultants]
    # Select only the consultants that have any chance of being a good match
    sql_suggestions = """
SELECT I.ITEM, COUNT(*) FROM TB_CATEGORY_QUESTION Q 
INNER JOIN TB_CATEGORY C ON C.ID = Q.CATEGORY_ID
INNER JOIN TB_CATEGORY_ITEM I ON I.CATEGORY_ID = C.ID
INNER JOIN TB_CONSULTANT_CATEGORY_ITEM_ASSIGNMENT IA ON IA.CATEGORY_ITEM_ID = I.ID
INNER JOIN TB_CONSULTANT CO ON CO.ID = IA.CONSULTANT_ID
WHERE Q.QUESTION = %(question)s
AND IA.CONSULTANT_ID = ANY(%(consultant_ids)s) 
GROUP BY I.ITEM
"""
    res_suggestions = await select_from(
        sql_suggestions,
        {"question": question_suggestions.question, "consultant_ids": consultant_ids},
    )
    for suggestion in res_suggestions:
        question_suggestions.suggestions.append(suggestion[0])
        question_suggestions.suggestions_count.append(suggestion[1])
    # get the number of consultants available for the question
    sql_available_consultants_count = """
SELECT
	COUNT(DISTINCT CO.ID)
FROM
	TB_CATEGORY C
	INNER JOIN TB_CATEGORY_QUESTION CQ ON CQ.CATEGORY_ID = C.ID
	INNER JOIN TB_CATEGORY_ITEM I ON C.ID = I.CATEGORY_ID
	INNER JOIN TB_CONSULTANT_CATEGORY_ITEM_ASSIGNMENT A ON A.CATEGORY_ITEM_ID = I.ID
	INNER JOIN TB_CONSULTANT CO ON CO.ID = A.CONSULTANT_ID
WHERE
	CQ.QUESTION = %(question)s
	AND A.CONSULTANT_ID = ANY(%(consultant_ids)s);
"""
    res_available_consultants_count = await select_from(
        sql_available_consultants_count,
        {"question": question_suggestions.question, "consultant_ids": consultant_ids},
    )
    question_suggestions.available_consultants_count = res_available_consultants_count[
        0
    ][0]
    return question_suggestions


async def save_session_question_as_str(session_id: str, question: str) -> int:
    res = await select_from(
        """
SELECT ID FROM TB_CATEGORY_QUESTION WHERE QUESTION = %(question)s
""",
        {"question": question},
    )
    if len(res) == 0:
        return 0
    return await save_session_question(session_id, res[0][0])


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
            await cur.execute(
                suggestions_sql, {"session_id": session_id, "question_id": question_id}
            )
            suggestions = await cur.fetchall()
            await cur.execute(
                selected_suggestions_sql,
                {"session_id": session_id, "question_id": question_id},
            )
            selected_suggestions = await cur.fetchall()
            question_suggestions = QuestionSuggestions(
                id=question_id,
                category=category,
                question=question,
                suggestions=[s[0] for s in suggestions],
                selected_suggestions=[s[0] for s in selected_suggestions],
                suggestions_count=[-1 for _ in suggestions],
                available_consultants_count=-1,
            )
            history.append(question_suggestions)
        return State(session_id=session_id, history=history)

    return await create_cursor(process)


def consultant_factory(
    consultant_details: list[tuple[int, str, str, str.str]],
) -> list[Consultant]:
    consultant_id_index = 0
    given_name_index = 1
    surname_index = 2
    linkedin_profile_url_index = 3
    email_index = 4
    consultants: list[Consultant] = []
    for consultant_detail in consultant_details:
        consultant = Consultant(
            id=consultant_detail[consultant_id_index],
            given_name=consultant_detail[given_name_index],
            surname=consultant_detail[surname_index],
            linkedin_profile_url=consultant_detail[linkedin_profile_url_index],
            email=consultant_detail[email_index],
        )
        consultants.append(consultant)
    return consultants


async def find_available_consultants(session_id: str) -> list[Consultant]:
    """Filter the consultants based on the session state."""

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
    consultant_details_base_sql = (
        "select ID, GIVEN_NAME, SURNAME, LINKEDIN_PROFILE_URL, EMAIL from TB_CONSULTANT"
    )
    consultant_details_sql = f"""
{consultant_details_base_sql}
where ID = ANY(%(consultant_ids)s)
"""
    categories_with_items = await select_from(sql, {"session_id": session_id})
    if len(categories_with_items) == 0:
        # return all consultants, because no categories have been picked up yet
        consultant_details = await select_from(consultant_details_base_sql, {})
        return consultant_factory(consultant_details)
    category_name_index = 1
    category_items_index = 2
    consultant_ids = []
    # Combine filters sequentially
    for index, category in enumerate(categories_with_items):
        category_name = category[category_name_index]
        category_items = category[category_items_index].split("@@")
        if index == 0:
            consultant_id_rows = await select_from(
                consultant_sql_template_initial,
                {"category_name": category_name, "category_items": category_items},
            )
            consultant_ids = [c[0] for c in consultant_id_rows]
        else:
            consultant_id_rows = await select_from(
                consultant_sql_template,
                {
                    "category_name": category_name,
                    "category_items": category_items,
                    "consultant_ids": consultant_ids,
                },
            )
            consultant_ids = [c[0] for c in consultant_id_rows]
    if len(consultant_ids) == 0:
        return []
    consultant_details = await select_from(
        consultant_details_sql, {"consultant_ids": consultant_ids}
    )
    return consultant_factory(consultant_details)


async def execute_script(script: str) -> State:
    async def process(cur: AsyncCursor) -> Awaitable[None]:
        await cur.execute(script)
        return None

    return await create_cursor(process)


async def session_exists(session_id: str) -> bool:
    """Check if the session exists."""
    sql = """
SELECT COUNT(*) FROM TB_SESSION WHERE SESSION_ID = %(session_id)s
"""
    res = await select_from(sql, {"session_id": session_id})
    return res[0][0] > 0


async def save_client_response(session_id: str, client_response: ClientResponse) -> int:
    """Save the client response to the database."""
    sql = """
INSERT INTO TB_SESSION_QUESTION_RESPONSES (SESSION_QUESTION_ID, CATEGORY_ITEM_ID) 
VALUES (
	(SELECT sq.id from TB_SESSION_QUESTION sq 
inner join TB_CATEGORY_QUESTION cq on cq.id = sq.CATEGORY_QUESTION_ID
INNER JOIN TB_SESSION s on s.id = sq.SESSION_ID
where s.session_id = %(session_id)s AND cq.QUESTION = %(question)s), 
	(SELECT ci.id from TB_CATEGORY_ITEM ci
INNER JOIN TB_CATEGORY_QUESTION cq on cq.category_id = ci.category_id
WHERE question = %(question)s and ci.item = %(item)s));
"""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        count = 0
        for item in client_response.response_items:
            try:
                await cur.execute(
                    sql,
                    {
                        "session_id": session_id,
                        "question": client_response.question,
                        "item": item,
                    },
                )
            except Exception as e:
                logger.error(f"Error saving client response: {e}")
                logger.error(
                    f"Parameters: {sql, {
                    "session_id": session_id,
                    "question": client_response.question,
                    "item": item
                }}"
                )
                raise e
            count += cur.rowcount
        return count

    return await create_cursor(process)


async def get_configuration() -> Configuration:
    sql = """
SELECT KEY, VALUE FROM TB_CONFIGURATION
"""
    res = await select_from(sql, {})
    config = {}
    for r in res:
        config[r[0]] = r[1]
    return Configuration(config)


async def get_configuration_value(
    key: str, default_value: str | None = None
) -> str | None:
    sql = """
SELECT VALUE FROM TB_CONFIGURATION WHERE KEY = %(key)s
"""
    res = await select_from(sql, {"key": key})
    if len(res) == 0:
        return default_value
    return res[0][0]
