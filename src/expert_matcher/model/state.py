from pydantic import BaseModel, Field

from expert_matcher.model.question import QuestionSuggestions


class State(BaseModel):
    session_id: str = Field(..., description="The session id")
    history: list[QuestionSuggestions] = Field(
        ..., description="The history of the session"
    )
