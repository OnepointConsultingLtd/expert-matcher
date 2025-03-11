import socketio
from aiohttp import web

from expert_matcher.config.config import ws_cfg
from expert_matcher.config.logger import logger
from expert_matcher.server.agent_session import AgentSession
from expert_matcher.config.config import ws_cfg


sio = socketio.AsyncServer(
    cors_allowed_origins=ws_cfg.websocket_cors_allowed_origins
)
app = web.Application()
sio.attach(app)


@sio.event
async def connect(sid: str, environ):
    logger.info(f"connect {sid}")


@sio.event
def disconnect(sid: str):
    logger.info(f"disconnect {sid}")


@sio.event
async def start_session(
    sid: str,
    client_session: str,
    session_steps: int = 6,
    language: str = "en",
    client_id: str = ""
):
    """
    Start the session by setting the main topic.
    """
    agent_session = AgentSession(sid, client_session)
    session_id = agent_session.session_id





