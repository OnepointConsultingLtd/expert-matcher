import socketio
from aiohttp import web
import asyncio

from expert_matcher.config.config import ws_cfg
from expert_matcher.server.agent_session import AgentSession
from expert_matcher.config.config import ws_cfg
from expert_matcher.config.logger import logger
from expert_matcher.model.session import Session
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
    get_configuration_value,
)
from expert_matcher.services.ai.differentiation_service import (
    fetch_differentiation_questions,
)

# Add this at the module level (top of file with other imports)
limited_consultants_lock = asyncio.Lock()

sio = socketio.AsyncServer(
    cors_allowed_origins=ws_cfg.websocket_cors_allowed_origins,
    logger=True,
    max_http_buffer_size=5242880,
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


@sio.event
async def save_differentiation_question_vote(sid: str, session_id: str, question: str, option: str):
    await save_differentiation_question_vote(session_id, question, option)


async def handle_response(sid: str, session_id: str | None, response: ClientResponse):
    # if not, throw error
    if not await session_exists(session_id):
        await handle_missing_session(sid, session_id)
        return

    # Get the consultants available for the current question, before saving the response
    if response:
        # save response
        await save_client_response(session_id, response)

    consultants_threshold = int(
        await get_configuration_value("candidate_threshold", "3")
    )
    question_suggestions = await select_next_question(session_id)
    if (
        question_suggestions is None
        or question_suggestions.available_consultants_count < consultants_threshold
        or question_suggestions.suggestions_count == 0
    ):
        await handle_limited_consultants(sid, session_id)
        return

    if question_suggestions:
        await send_question_suggestions(sid, session_id, question_suggestions)
    else:
        await send_state(sid, session_id, question_suggestions)


async def handle_missing_session(sid: str, session_id: str):
    await send_error(sid, session_id, "Session not found")


async def send_error(sid: str, session_id: str, message: str):
    logger.error(message)
    server_message = ServerMessage(
        status=MessageStatus.ERROR,
        session_id=session_id,
        content=ErrorMessage(message=message),
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
    # Replace last question if it is the same as the new one
    if state.history[-1].id == question_suggestions.id:
        state.history[-1] = question_suggestions
    server_message = ServerMessage(
        status=MessageStatus.OK,
        session_id=session_id,
        content=state.model_dump(),
        content_type=ContentType.HISTORY,
    )
    await sio.emit(WSCommand.SERVER_MESSAGE, server_message.model_dump(), room=sid)


async def handle_limited_consultants(sid: str, session_id: str):
    async with limited_consultants_lock:  # This ensures only one execution at a time
        try:
            logger.info(f"Fetching differentiation questions for {session_id}")
            differentiation_questions = await fetch_differentiation_questions(session_id)
            try:
                for question in differentiation_questions.questions:
                    # Emit every question
                    server_message = ServerMessage(
                        status=MessageStatus.OK,
                        session_id=session_id,
                        content=question.model_dump(),
                        content_type=ContentType.DIFFERENTIATION_QUESTIONS,
                    )
                    await sio.emit(
                        WSCommand.SERVER_MESSAGE,
                        server_message.model_dump(),
                        room=sid,
                        callback=True,
                    )

                for candidate in differentiation_questions.candidates:
                    server_message = ServerMessage(
                        status=MessageStatus.OK,
                        session_id=session_id,
                        content=candidate.model_dump(),
                        content_type=ContentType.CANDIDATE,
                    )
                    await sio.emit(
                        WSCommand.SERVER_MESSAGE,
                        server_message.model_dump(),
                        room=sid,
                        callback=True,
                    )
                logger.info(f"Sent differentiation questions to {sid}")
            except Exception as emit_error:
                await send_error(
                    sid, session_id, f"Error during socket.io emit: {str(emit_error)}"
                )
        except Exception as e:
            logger.exception(f"Error in handle_limited_consultants: {str(e)}")
            await send_error(
                sid, session_id, f"Error in handle_limited_consultants: {str(e)}"
            )
