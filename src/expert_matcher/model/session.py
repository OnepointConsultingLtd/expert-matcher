from pydantic import BaseModel, Field


class Session(BaseModel):
    session_id: str = Field(..., description="The ID of the session")
    email: str = Field(..., description="The email of the user")
    
    
    
