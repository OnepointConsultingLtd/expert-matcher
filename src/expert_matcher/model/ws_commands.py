from enum import StrEnum

from pydantic import BaseModel, Field
from expert_matcher.model.state import State


class WSCommand(StrEnum):
    """
    Enum representing the commands for the WebSocket communication.
    """

    START_SESSION = "start_session"
    SERVER_MESSAGE = "server_message"
    ERROR = "error"


class MessageStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class ServerMessage(BaseModel):
    status: MessageStatus = Field(default=MessageStatus.OK, description="Whether the command was successful")
    content: any = Field(default=None, description="The content of the message")
