import socketio
from aiohttp import web

from expert_matcher.config.config import ws_cfg
from expert_matcher.server.agent_session import AgentSession
from expert_matcher.config.config import ws_cfg
from expert_matcher.config.logger import logger
from expert_matcher.model.session import Session
from expert_matcher.model.ws_commands import WSCommand
from expert_matcher.model.ws_commands import ServerMessage, MessageStatus, ErrorMessage, ClientResponse
from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.services.db.db_persistence import (
    select_first_question,
    select_next_question,
    save_session,
    save_session_question,
    get_session_state,
    session_exists,
    save_client_response
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
        default_email = "default@email.com"
        await save_session(Session(session_id=session_id, email=default_email))
        question_suggestions = await select_first_question(session_id)
        await send_question_suggestions(session_id, question_suggestions)
    else:
        # check if session exists
        # if not, throw error
        if not await session_exists(client_session):
            server_message = ServerMessage(
                status=MessageStatus.ERROR,
                session_id=session_id,
                content=ErrorMessage(message="Session not found"),
            )
            await sio.emit(WSCommand.SERVER_MESSAGE, server_message.model_dump())
        question_suggestions = await select_next_question(client_session)
        await send_question_suggestions(session_id, question_suggestions)


async def send_question_suggestions(
    session_id: str, question_suggestions: QuestionSuggestions
):
    await save_session_question(session_id, question_suggestions.id)
    state = await get_session_state(session_id)
    # Change the last question suggestions to the optimized suggestions
    state.history[-1].suggestions = question_suggestions.suggestions
    server_message = ServerMessage(
        status=MessageStatus.OK, session_id=session_id, content=state
    )
    await sio.emit(WSCommand.SERVER_MESSAGE, server_message.model_dump())

@sio.event
async def client_response(sid: str, session_id: str, response: str):
    # convert response from json to ClientResponse
    client_response = ClientResponse.model_validate_json(response)
    # save response
    await save_client_response(session_id, client_response)
