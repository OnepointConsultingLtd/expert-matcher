from expert_matcher.services.db.db_persistence import execute_script
from expert_matcher.config.config import cfg
from expert_matcher.model.differentiation_questions import (
    DifferentiationQuestionsResponse,
    DifferentiationQuestionVotes,
    DifferentiationQuestionVote,
)


async def provide_initial_question(session_id: str):
    await execute_script(
        f"""
delete from tb_session where session_id = '{session_id}';
                         
insert into tb_session(session_id, user_email) values('{session_id}', 'anon{session_id}@test.com');

insert into TB_SESSION_QUESTION(SESSION_ID, CATEGORY_QUESTION_ID)
values((select id from TB_SESSION where SESSION_ID='{session_id}'), 
(select id from TB_CATEGORY_QUESTION order by order_index limit 1));
        """
    )


async def provide_dummy_data(session_id: str):
    # Create
    #
    await provide_initial_question(session_id)
    await execute_script(
        f"""

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

"""
    )


def provide_differentiation_questions() -> DifferentiationQuestionsResponse:
    with open(cfg.base_folder / "docs/sample_differentiation_questions.json", "r") as f:
        return DifferentiationQuestionsResponse.model_validate_json(f.read())


def create_differentiation_question_vote(session_id: str) -> DifferentiationQuestionVotes:
    differentiation_questions = provide_differentiation_questions()
    votes = []
    for question in differentiation_questions.questions:
        for option in question.options:
            votes.append(DifferentiationQuestionVote(session_id=session_id, question=question.question, option=option.option))
    return DifferentiationQuestionVotes(votes=votes)

