from enum import StrEnum

from pydantic import BaseModel, Field


class WSCommand(StrEnum):
    """
    Enum representing the commands for the WebSocket communication.
    """

    START_SESSION = "start_session"
    SERVER_MESSAGE = "server_message"
    ECHO = "echo"
    ERROR = "error"


class MessageStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class ServerMessage(BaseModel):
    status: MessageStatus = Field(
        default=MessageStatus.OK, description="Whether the command was successful"
    )
    session_id: str = Field(default="", description="The session id")
    content: dict = Field(default=None, description="The content of the message")


class ClientResponse(BaseModel):
    session_id: str = Field(default="", description="The session id")
    question: str = Field(default="", description="The response from the client")
    response_items: list[str] = Field(
        default=[], description="The response items from the client"
    )


class ErrorMessage(BaseModel):
    message: str = Field(default=None, description="The content of the message")
