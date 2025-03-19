from typing import Awaitable

from psycopg import AsyncCursor

from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.model.session import Session
from expert_matcher.model.state import State
from expert_matcher.services.db.db_support import select_from, create_cursor
from expert_matcher.model.consultant import Consultant, ConsultantExperience
from expert_matcher.model.ws_commands import ClientResponse
from expert_matcher.model.configuraton import Configuration
from expert_matcher.model.differentiation_questions import (
    DifferentiationQuestionsResponse,
    DifferentiationQuestion,
    DifferentiationQuestionOption,
)
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
ORDER BY order_index offset (SELECT count(*) FROM TB_SESSION_QUESTION sq
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
ORDER BY I.ITEM ASC
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
    question_id = res[0][0]
    return await save_session_question(session_id, question_id)


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
WHERE s.session_id = %(session_id)s and cq.ID = %(question_id)s
ORDER BY 1
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
    consultant_details: list[tuple[int, str, str, str, str, str, str, str, str]],
) -> list[Consultant]:
    consultant_id_index = 0
    given_name_index = 1
    surname_index = 2
    linkedin_profile_url_index = 3
    email_index = 4
    cv_index = 5
    photo_url_200_index = 7
    photo_url_400_index = 8
    consultants: list[Consultant] = []
    for consultant_detail in consultant_details:
        consultant = Consultant(
            id=consultant_detail[consultant_id_index],
            given_name=consultant_detail[given_name_index],
            surname=consultant_detail[surname_index],
            linkedin_profile_url=consultant_detail[linkedin_profile_url_index],
            email=consultant_detail[email_index],
            cv=consultant_detail[cv_index],
            photo_url_200=consultant_detail[photo_url_200_index],
            photo_url_400=consultant_detail[photo_url_400_index],
        )
        consultants.append(consultant)
    return consultants


async def find_available_consultants(
    session_id: str, extract_experiences: bool = False
) -> list[Consultant]:
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
    consultant_details_base_sql = """SELECT * FROM (SELECT C.ID, C.GIVEN_NAME, C.SURNAME, C.LINKEDIN_PROFILE_URL, C.EMAIL, C.CV, STRING_AGG(S.SKILL_NAME, '@@'), C.LINKEDIN_PHOTO_200, C.LINKEDIN_PHOTO_200 FROM TB_CONSULTANT C 
INNER JOIN TB_CONSULTANT_SKILL CS ON C.ID = CS.CONSULTANT_ID INNER JOIN TB_SKILL S ON S.ID = CS.SKILL_ID
GROUP BY C.ID, C.GIVEN_NAME, C.SURNAME, C.LINKEDIN_PROFILE_URL, C.EMAIL, C.CV) q"""
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
    consultants = consultant_factory(consultant_details)
    if extract_experiences:
        consultant_dict = {c.id: c for c in consultants}
        await inject_consultant_experiences(consultant_ids, consultant_dict)
    return consultants


async def inject_consultant_experiences(
    consultant_ids: list[int], consultant_dict: dict[int, Consultant]
):
    """Extract the experiences of the consultants."""
    consultant_experiences_sql = """
SELECT CE.ID, CE.CONSULTANT_ID consultant_id, CE.TITLE, CE.LOCATION, CE.START_DATE, CE.END_DATE, C.COMPANY_NAME
FROM TB_CONSULTANT_EXPERIENCE CE
INNER JOIN TB_COMPANY C ON C.ID = CE.COMPANY_ID
WHERE CE.CONSULTANT_ID = ANY(%(consultant_ids)s)
"""
    consultant_experiences = await select_from(
        consultant_experiences_sql, {"consultant_ids": consultant_ids}
    )
    consultant_experiences_id_index = 0
    consultant_id_index = 1
    title_index = 2
    location_index = 3
    start_date_index = 4
    end_date_index = 5
    company_name_index = 6
    for experience in consultant_experiences:
        consultant_experience = ConsultantExperience(
            id=experience[consultant_experiences_id_index],
            consultant_id=experience[consultant_id_index],
            title=experience[title_index],
            location=experience[location_index],
            start_date=experience[start_date_index],
            end_date=experience[end_date_index],
            company_name=experience[company_name_index],
        )
        consultant_dict[consultant_experience.consultant_id].experiences.append(
            consultant_experience
        )


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


async def save_differentiation_question(
    session_id: str, differentiation_questions: DifferentiationQuestionsResponse
) -> tuple[int, int, int]:
    """Save a differentiation question, its options and the associates consultants"""
    sql_question = """
INSERT INTO TB_DIFFERENTIATION_QUESTION(QUESTION, DIMENSION, SESSION_ID)
VALUES(%(question)s, %(topic)s, %(session_id)s)
ON CONFLICT(QUESTION, DIMENSION, SESSION_ID) DO NOTHING
RETURNING ID
"""
    sql_option = """
INSERT INTO TB_DIFFERENTIATION_QUESTION_OPTION(DIFFERENTIATION_QUESTION_ID, OPTION_TEXT)
VALUES(%(question_id)s, %(option)s)
ON CONFLICT(DIFFERENTIATION_QUESTION_ID, OPTION_TEXT) DO NOTHING
RETURNING ID
"""
    sql_option_assignment = """
INSERT INTO TB_DIFFERENTIATION_QUESTION_OPTION_ASSIGNMENT(CONSULTANT_ID, DIFFERENTIATION_QUESTION_OPTION_ID)
VALUES(%(consultant_id)s, %(option_id)s)
ON CONFLICT(CONSULTANT_ID, DIFFERENTIATION_QUESTION_OPTION_ID) DO NOTHING
"""
    sql_consultant_select = """
SELECT ID FROM TB_CONSULTANT WHERE EMAIL = %(consultant_email)s
"""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        updated_questions = 0
        updated_options = 0
        updated_option_assignments = 0
        for question in differentiation_questions.questions:
            # insert question
            await cur.execute(
                sql_question,
                {
                    "question": question.question,
                    "topic": question.dimension,
                    "session_id": session_id,
                },
            )
            updated_questions += cur.rowcount
            rows_question = await cur.fetchone()
            if rows_question and len(rows_question) > 0:
                question_id = rows_question[0]
                # insert options
                for option in question.options:
                    await cur.execute(
                        sql_option,
                        {"question_id": question_id, "option": option.option},
                    )
                    updated_options += cur.rowcount
                    rows_option = await cur.fetchone()
                    if rows_option and len(rows_option) > 0:
                        option_id = rows_option[0]
                        # insert option assignments
                        for consultant_email in option.consultants:
                            row_cursor = await cur.execute(
                                sql_consultant_select,
                                {"consultant_email": consultant_email},
                            )
                            row_consultant = list(await row_cursor.fetchall())
                            if row_consultant and len(row_consultant) > 0:
                                consultant_id = row_consultant[0][0]
                                await cur.execute(
                                    sql_option_assignment,
                                    {
                                        "consultant_id": consultant_id,
                                        "option_id": option_id,
                                    },
                                )
                                updated_option_assignments += cur.rowcount
        return updated_questions, updated_options, updated_option_assignments

    return await create_cursor(process)


async def delete_differentiation_question(session_id: str) -> int:
    sql_delete_question = """
DELETE FROM TB_DIFFERENTIATION_QUESTION WHERE SESSION_ID = %(session_id)s
"""

    async def process(cur: AsyncCursor) -> Awaitable[int]:
        await cur.execute(sql_delete_question, {"session_id": session_id})
        return cur.rowcount

    return await create_cursor(process)


async def read_differentiation_question(
    session_id: str,
) -> DifferentiationQuestionsResponse | None:
    sql_question = """
SELECT Q.QUESTION, Q.DIMENSION, O.OPTION_TEXT, C.EMAIL FROM TB_DIFFERENTIATION_QUESTION Q
INNER JOIN TB_DIFFERENTIATION_QUESTION_OPTION O ON O.DIFFERENTIATION_QUESTION_ID = Q.ID
INNER JOIN TB_DIFFERENTIATION_QUESTION_OPTION_ASSIGNMENT A ON A.DIFFERENTIATION_QUESTION_OPTION_ID = O.ID
INNER JOIN TB_CONSULTANT C ON C.ID = A.CONSULTANT_ID
WHERE Q.SESSION_ID = %(session_id)s
ORDER BY Q.QUESTION, O.OPTION_TEXT
"""
    res = await select_from(sql_question, {"session_id": session_id})
    if len(res) == 0:
        return None
    index_question = 0
    index_dimension = 1
    index_option = 2
    index_consultant = 3
    questions: list[DifferentiationQuestion] = []
    current_question: str = ""
    current_option = ""
    current_consultant = ""
    for r in res:
        if current_question != r[index_question]:
            current_question = r[index_question]
            current_option = r[index_option]
            current_consultant = r[index_consultant]
            option = DifferentiationQuestionOption(
                option=current_option, consultants=[current_consultant]
            )
            question = DifferentiationQuestion(
                question=current_question,
                dimension=r[index_dimension],
                options=[option],
            )
            questions.append(question)
        else:
            if current_option != r[index_option]:
                current_option = r[index_option]
                current_consultant = r[index_consultant]
                option = DifferentiationQuestionOption(
                    option=current_option, consultants=[current_consultant]
                )
                questions[-1].options.append(option)
            elif current_consultant != r[index_consultant]:
                current_consultant = r[index_consultant]
                questions[-1].options[-1].consultants.append(current_consultant)

    consultants = await find_available_consultants(session_id)
    return DifferentiationQuestionsResponse(
        questions=questions, candidates=consultants, state=None
    )
