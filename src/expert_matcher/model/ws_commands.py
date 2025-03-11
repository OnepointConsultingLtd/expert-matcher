from enum import Enum


class WSCommand(Enum):
    """
    Enum representing the commands for the WebSocket communication.
    """

    START_SESSION = "start_session"
    SERVER_MESSAGE = "server_message"
    ERROR = "error"
