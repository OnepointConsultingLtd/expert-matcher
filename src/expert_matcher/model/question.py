from pydantic import BaseModel, Field


class QuestionSuggestions(BaseModel):
    id: int = Field(description="The id of the question")
    category: str = Field(description="The category of the question")
    question: str = Field(description="The question to be asked")
    suggestions: list[str] = Field(description="All suggestions for the question")
    suggestions_count: list[int] = Field(
        description="The number of consultants per suggestion"
    )
    selected_suggestions: list[str] = Field(
        description="The selected suggestions used in a conversation",
        default_factory=list,
    )
    available_consultants_count: int = Field(
        description="The number of consultants available for the question"
    )


class QuestionAnswer(BaseModel):
    question: str = Field(description="The question")
    answer: str = Field(description="The answer")

    def __str__(self):
        return f"""{self.question}
{self.answer}"""
