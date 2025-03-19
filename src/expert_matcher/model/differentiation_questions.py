from pydantic import BaseModel, Field
from expert_matcher.model.consultant import Consultant
from expert_matcher.model.state import State


class DifferentiationQuestionOption(BaseModel):
    option: str = Field(description="The option to be asked")
    consultants: list[str] = Field(
        description="The consultants email addresses that match the option"
    )


class DifferentiationQuestion(BaseModel):
    question: str = Field(
        description="The question to be asked to differentiate between the consultants"
    )
    dimension: str = Field(description="The dimension of the question")
    options: list[DifferentiationQuestionOption] = Field(
        description="The options of the question with the consultants that match the option"
    )


class DifferentiationQuestions(BaseModel):
    questions: list[DifferentiationQuestion] = Field(
        description="The questions to be asked"
    )


class DifferentiationQuestionsResponse(BaseModel):
    questions: list[DifferentiationQuestion] = Field(
        description="The questions to be asked"
    )
    candidates: list[Consultant] = Field(
        ..., description="The candidates related to the questions"
    )
    state: State | None = Field(default=None, description="The state of the session")
