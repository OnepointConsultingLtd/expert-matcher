import socketio
from aiohttp import web

from expert_matcher.config.config import ws_cfg
from expert_matcher.server.agent_session import AgentSession
from expert_matcher.config.config import ws_cfg
from expert_matcher.config.logger import logger
from expert_matcher.model.session import Session
from expert_matcher.model.consultant import Consultant
from expert_matcher.model.ws_commands import WSCommand
from expert_matcher.model.ws_commands import (
    ServerMessage,
    MessageStatus,
    ErrorMessage,
    ClientResponse,
    ContentType,
)
from expert_matcher.model.question import QuestionSuggestions
from expert_matcher.services.db.db_persistence import (
    select_first_question,
    select_next_question,
    save_session,
    save_session_question,
    get_session_state,
    session_exists,
    save_client_response,
    find_available_consultants,
    get_configuration_value,
)
from expert_matcher.services.ai.differentiation_service import (
    generate_differentiation_questions,
)


sio = socketio.AsyncServer(
    cors_allowed_origins=ws_cfg.websocket_cors_allowed_origins, logger=True
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
    client_id: str = "",
):
    """
    Start the session by setting the main topic.
    """
    logger.info(f"Start session {sid}")
    agent_session = AgentSession(sid, client_session)
    session_id = agent_session.session_id
    if not client_session:
        default_email = "default@email.com"
        await save_session(Session(session_id=session_id, email=default_email))
        question_suggestions = await select_first_question(session_id)
        await send_question_suggestions(sid, session_id, question_suggestions)
    else:
        await handle_response(sid, session_id, None)


@sio.event
async def echo(sid: str, session_id: str):
    logger.info(f"echo {sid}")
    await sio.emit(WSCommand.ECHO, session_id, room=sid)


@sio.event
async def client_response(sid: str, response: str):
    logger.info(f"Client response {sid}")
    # convert response from json to ClientResponse
    client_response = ClientResponse.model_validate_json(response)
    await handle_response(sid, client_response.session_id, client_response)


async def handle_response(sid: str, session_id: str | None, response: ClientResponse):
    # if not, throw error
    if not await session_exists(session_id):
        await handle_missing_session(sid, session_id)
        return

    # Get the consultants available for the current question, before saving the response
    previous_question_consultants = await find_available_consultants(session_id)
    if response:
        # save response
        await save_client_response(session_id, response)

    consultants_threshold = int(
        await get_configuration_value("consultants_threshold", "3")
    )
    question_suggestions = await select_next_question(session_id)
    if question_suggestions.available_consultants_count < consultants_threshold:
        await handle_limited_consultants(sid, session_id)
        return

    if question_suggestions:
        await send_question_suggestions(sid, session_id, question_suggestions)
    else:
        await send_state(sid, session_id, question_suggestions)


async def handle_missing_session(sid: str, session_id: str):
    server_message = ServerMessage(
        status=MessageStatus.ERROR,
        session_id=session_id,
        content=ErrorMessage(message="Session not found"),
        content_type=ContentType.ERROR,
    )
    await sio.emit(WSCommand.SERVER_MESSAGE, server_message.model_dump(), room=sid)


async def send_question_suggestions(
    sid: str, session_id: str, question_suggestions: QuestionSuggestions
):
    await save_session_question(session_id, question_suggestions.id)
    await send_state(sid, session_id, question_suggestions)


async def send_state(
    sid: str, session_id: str, question_suggestions: QuestionSuggestions
):
    state = await get_session_state(session_id)
    if not state:
        raise ValueError(f"Session {session_id} not found")
    # overwrite the last question suggestions with the new ones
    last_question_suggestions = state.history[-1]
    last_question_suggestions.suggestions = question_suggestions.suggestions
    last_question_suggestions.suggestions_count = question_suggestions.suggestions_count
    last_question_suggestions.selected_suggestions = (
        question_suggestions.selected_suggestions
    )
    last_question_suggestions.available_consultants_count = (
        question_suggestions.available_consultants_count
    )
    server_message = ServerMessage(
        status=MessageStatus.OK, session_id=session_id, content=state.model_dump(), content_type=ContentType.HISTORY
    )
    await sio.emit(WSCommand.SERVER_MESSAGE, server_message.model_dump(), room=sid)


async def handle_limited_consultants(
    sid: str, session_id: str
):
    # send message to user that there are limited consultants
    differentiation_questions = await generate_differentiation_questions(session_id)
    server_message = ServerMessage(
        status=MessageStatus.OK, session_id=session_id, content=differentiation_questions.model_dump(), content_type=ContentType.DIFFERENTIATION_QUESTIONS
    )
    await sio.emit(WSCommand.SERVER_MESSAGE, server_message.model_dump(), room=sid)
