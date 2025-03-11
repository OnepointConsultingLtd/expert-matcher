from pydantic import BaseModel, Field


class QuestionSuggestions(BaseModel):
    id: int = Field(description="The id of the question")
    category: str = Field(description="The category of the question")
    question: str = Field(description="The question to be asked")
    suggestions: list[str] = Field(description="All suggestions for the question")
    selected_suggestions: list[str] = Field(
        description="The selected suggestions used in a conversation", default_factory=list
    )
