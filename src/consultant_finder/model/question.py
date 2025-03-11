from pydantic import BaseModel, Field


class QuestionSuggestions(BaseModel):
    category: str = Field(description="The category of the question")
    question: str = Field(description="The question to be asked")
    suggestions: list[str] = Field(description="The suggestions for the question")


