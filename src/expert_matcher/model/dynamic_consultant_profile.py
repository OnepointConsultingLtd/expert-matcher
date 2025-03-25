from pydantic import BaseModel, Field
from expert_matcher.model.question import QuestionAnswer
from expert_matcher.model.consultant import Consultant


class MatchingItem(BaseModel):
    question: str = Field(description="The question")
    answer: str = Field(
        description="The answer to the question to which the profile matches"
    )
    reasoning: str = Field(
        description="Why the item matches the selected answers to the questions"
    )

    def __str__(self):
        return f"""- {self.question}
{self.answer}
{self.reasoning}
"""

class DynamicConsultantProfile(BaseModel):
    profile: str = Field(description="The profile summary of the consultant in markdown format with the most important facts highlighted in bold characters.")
    matching_items: list[MatchingItem] = Field(
        description="The items that match the selected answers to the questions"
    )

    def __str__(self):
        return f"""{self.profile}

Profile details:
{"\n\n".join([str(item) for item in self.matching_items])}
"""


class DynamicConsultantProfileResponse(BaseModel):
    question_answers: list[QuestionAnswer]
    differentiation_question_answers: list[QuestionAnswer]
    consultant: Consultant
