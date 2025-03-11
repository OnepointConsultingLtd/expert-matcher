from consultant_finder.model.question import QuestionSuggestions
from consultant_finder.services.db.db_support import select_from

async def select_first_question() -> QuestionSuggestions | None:
    """Select the first question with its suggestions."""

    sql = """
SELECT C.ID CATEGORY_ID, C.NAME CATEGORY, Q.question FROM TB_CATEGORY_QUESTION Q 
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
    category_id = res[0][category_pos]
    question_suggestions = QuestionSuggestions(
        category=res[0][category],
        question=res[0][question],
        suggestions=[]
    )
    sql_suggestions = """
SELECT ITEM FROM TB_CATEGORY_ITEM WHERE CATEGORY_ID = %(category_id)s;
"""
    res_suggestions = await select_from(sql_suggestions, {"category_id": category_id})
    for suggestion in res_suggestions:
        question_suggestions.suggestions.append(suggestion[0])
    return question_suggestions
    
    
