import { useChatStore } from "../context/ChatStore";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useAppStore } from "../context/AppStore";
import { MessageStatus, WS_EVENTS } from "../types/ws";
import { getSessionId } from "../lib/sessionFunctions";
import { safeEmit, startSession } from "../lib/websocketFunctions";
import { ServerMessage } from "../types/ws";

export function useWebsockets() {
    const { websocketUrl, socket } = useChatStore();
    const { setConnected, setSessionId, setHistory, setSending, setErrorMessage } = useAppStore();

    useEffect(() => {
        socket.current = io(websocketUrl);

        function onConnect() {
            setConnected(true);
            setSending(true);
            const sessionId = getSessionId();
            startSession(socket.current, sessionId);
            console.info("Connected to websocket");

            setInterval(() => {
                safeEmit(socket.current, WS_EVENTS.ECHO, getSessionId());
            }, 60000);
        }

        function onDisconnect() {
            setConnected(false);
            console.info("Disconnected from websocket");
        }

        function onServerMessage(serverMessage: ServerMessage) {
            console.info("Server message: ", serverMessage);
            setSending(false);
            if(serverMessage.status === MessageStatus.OK) {
                setSessionId(serverMessage.session_id);
                setHistory(serverMessage.content?.history ?? []);
            } else {
                console.error("Server message: ", serverMessage);
                setErrorMessage("An error occurred.");
            }
        }

        socket.current.on(WS_EVENTS.CONNECT, onConnect);
        socket.current.on(WS_EVENTS.DISCONNECT, onDisconnect);
        socket.current.on(WS_EVENTS.SERVER_MESSAGE, onServerMessage);
        socket.current.on('connect_error', function(err) {
            console.error("client connect_error: ", err);
        });
        
        socket.current.on('connect_timeout', function(err) {
            console.error("client connect_timeout: ", err);
        });

        return () => {
            if(socket.current) {
                socket.current.off(WS_EVENTS.CONNECT, onConnect);
                socket.current.off(WS_EVENTS.DISCONNECT, onDisconnect);
                socket.current.off(WS_EVENTS.SERVER_MESSAGE, onServerMessage);
            }
        }
    }, [websocketUrl]);
}
