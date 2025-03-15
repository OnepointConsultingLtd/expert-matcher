export enum MessageStatus {
    OK = "ok",
    ERROR = "error"
}

export interface ServerMessage {
    status: MessageStatus;
    session_id: string;
    content?: Record<string, any>;
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
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    ERROR: "error",
    SERVER_MESSAGE: "server_message",
    ECHO: "echo",
}

export const WS_COMMANDS = {
    START_SESSION: "start_session",
    CLIENT_RESPONSE: "client_response",
    ECHO: "echo",
}

