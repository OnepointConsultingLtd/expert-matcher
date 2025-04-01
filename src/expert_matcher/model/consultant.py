import datetime
from pydantic import BaseModel, Field
from collections import defaultdict


class ConsultantExperience(BaseModel):
    id: int = Field(description="The ID of the consultant experience")
    consultant_id: int = Field(description="The ID of the consultant")
    company_name: str = Field(description="The name of the company")
    location: str = Field(description="The location of the company")
    title: str = Field(description="The title of the consultant")
    start_date: datetime.date | None = Field(
        description="The start date of the consultant"
    )
    end_date: datetime.date | None = Field(description="The end date of the consultant")

    def __str__(self):
        return (
            f"{self.company_name} - {self.title} ({self.start_date}"
            + (f" - {self.end_date}" if self.end_date else "")
            + ")"
        )


class Consultant(BaseModel):
    id: int = Field(description="The ID of the consultant")
    given_name: str = Field(description="The given name of the consultant")
    surname: str = Field(description="The family name of the consultant")
    linkedin_profile_url: str = Field(
        description="The LinkedIn profile URL of the consultant"
    )
    email: str = Field(description="The email of the consultant")
    cv: str = Field(description="The CV of the consultant")
    skills: list[str] = Field(default=[], description="The skills of the consultant")
    experiences: list[ConsultantExperience] = Field(
        default=[], description="The experiences of the consultant"
    )
    photo_url_200: str | None = Field(
        default="", description="The URL of the consultant's photo"
    )
    photo_url_400: str | None = Field(
        default="", description="The URL of the consultant's photo"
    )
    cv_summary: str | None = Field(
        default="", description="The summary of the consultant's CV"
    )

    def __str__(self):
        return f"""
Name: {self.given_name} {self.surname}
Email: {self.email}
LinkedIn: {self.linkedin_profile_url}
CV: {self.cv}
Skills: {"\n- ".join(self.skills)}
Experiences: {"\n- ".join([str(e) for e in self.experiences])}
CV Summary: {self.cv_summary}
"""


class VotedOn(BaseModel):
    question: str = Field(description="The question")
    dimension: str = Field(description="The dimension of the question")
    option: str = Field(description="The option")


class ConsultantWithVotes(Consultant):
    votes: int = Field(default=0, description="The votes of the consultant")
    voted_on: dict[str, list[VotedOn]] = Field(
        default=defaultdict(list),
        description="The questions the consultant has voted on",
    )
