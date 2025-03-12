from pydantic import BaseModel, Field


class Consultant(BaseModel):
    id: int = Field(description="The ID of the consultant")
    given_name: str = Field(description="The given name of the consultant")
    surname: str = Field(description="The family name of the consultant")
    linkedin_profile_url: str = Field(description="The LinkedIn profile URL of the consultant")

