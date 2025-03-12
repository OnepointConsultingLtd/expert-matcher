import socketio
from aiohttp import web

from expert_matcher.config.config import ws_cfg
from expert_matcher.server.agent_session import AgentSession
from expert_matcher.config.config import ws_cfg
from expert_matcher.config.logger import logger
from expert_matcher.model.session import Session
from expert_matcher.model.ws_commands import ServerMessage, MessageStatus
from expert_matcher.services.db.db_persistence import (
    select_first_question,
    save_session,
    save_session_question,
    get_session_state
)


sio = socketio.AsyncServer(cors_allowed_origins=ws_cfg.websocket_cors_allowed_origins)
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
    client_id: str = "",
):
    """
    Start the session by setting the main topic.
    """
    agent_session = AgentSession(sid, client_session)
    session_id = agent_session.session_id
    if not client_session:
        await save_session(Session(session_id=session_id, email=client_id))
        question_suggestions = await select_first_question()
        await save_session_question(session_id, question_suggestions.id)
        state = await get_session_state(session_id)
        server_message = ServerMessage(status=MessageStatus.OK, content=state)
        await sio.emit("session_state", server_message.model_dump())
    else:
        
