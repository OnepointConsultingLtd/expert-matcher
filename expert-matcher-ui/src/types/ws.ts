export enum MessageStatus {
  OK = 'ok',
  ERROR = 'error',
}

export enum ContentType {
  HISTORY = 'history',
  DIFFERENTIATION_QUESTIONS = 'differentiation_questions',
  CANDIDATE = 'candidate',
  VOTES_SAVED = 'votes_saved',
  ERROR = 'error',
}

export interface ServerMessage {
  status: MessageStatus;
  session_id: string;
  content?: Record<string, any>;
  content_type: ContentType;
}

export interface ClientResponse {
  session_id: string;
  question: string;
  response_items: string[];
}

export interface ErrorMessage {
  message?: string;
}

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  SERVER_MESSAGE: 'server_message',
  ECHO: 'echo',
};

export const WS_COMMANDS = {
  START_SESSION: 'start_session',
  CLIENT_RESPONSE: 'client_response',
  ECHO: 'echo',
  SAVE_DIFFERENTIATION_QUESTION_VOTE: 'save_differentiation_question_vote_ws',
};
