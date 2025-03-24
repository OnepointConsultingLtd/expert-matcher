import { Socket } from 'socket.io-client';
import { ClientResponse, WS_COMMANDS } from '../types/ws';
import { DifferentiationQuestionVotes } from '../types/differentiation_questions';
export function startSession(socket: Socket | null, sessionId: string | null) {
  safeEmit(socket, WS_COMMANDS.START_SESSION, sessionId);
}

export function sendClientResponse(socket: Socket | null, clientResponse: ClientResponse) {
  safeEmit(socket, WS_COMMANDS.CLIENT_RESPONSE, JSON.stringify(clientResponse));
}

export function sendDifferentiationQuestionVotesWs(
  socket: Socket | null,
  differentiationQuestionVotes: DifferentiationQuestionVotes
) {
  safeEmit(
    socket,
    WS_COMMANDS.SAVE_DIFFERENTIATION_QUESTION_VOTE,
    JSON.stringify(differentiationQuestionVotes)
  );
}

export function echo(socket: Socket | null, sessionId: string) {
  safeEmit(socket, WS_COMMANDS.ECHO, sessionId);
}

export function safeEmit(socket: Socket | null, event: string, message: any) {
  if (socket?.connected) {
    socket.emit(event, message, (ack: any) => {
      console.info('Server acknowledged:', ack);
    });
    console.info(`Emitting event: ${event} with args: ${JSON.stringify(message)}`);
  } else {
    console.error(`Socket is not connected, cannot emit event: ${event}`);
  }
}
