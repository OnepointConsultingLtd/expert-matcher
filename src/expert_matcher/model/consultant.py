import datetime
from pydantic import BaseModel, Field


class ConsultantExperience(BaseModel):
    id: int = Field(description="The ID of the consultant experience")
    consultant_id: int = Field(description="The ID of the consultant")
    company_name: str = Field(description="The name of the company")
    location: str = Field(description="The location of the company")
    title: str = Field(description="The title of the consultant")
    start_date: datetime.date | None = Field(description="The start date of the consultant")
    end_date: datetime.date | None = Field(description="The end date of the consultant")

    def __str__(self):
        return f"{self.company_name} - {self.title} ({self.start_date}" + (f" - {self.end_date}" if self.end_date else "") + ")"


class Consultant(BaseModel):
    id: int = Field(description="The ID of the consultant")
    given_name: str = Field(description="The given name of the consultant")
    surname: str = Field(description="The family name of the consultant")
    linkedin_profile_url: str = Field(
        description="The LinkedIn profile URL of the consultant"
    )
    email: str = Field(description="The email of the consultant")
    cv: str = Field(description="The CV of the consultant")
    skills: list[str] = Field(default=[],description="The skills of the consultant")
    experiences: list[ConsultantExperience] = Field(default=[], description="The experiences of the consultant")
