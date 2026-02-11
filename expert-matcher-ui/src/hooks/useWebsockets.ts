import { useChatStore } from '../context/ChatStore';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../context/AppStore';
import { ContentType, MessageStatus, WS_EVENTS } from '../types/ws';
import { getSessionId } from '../lib/sessionFunctions';
import { safeEmit, startSession } from '../lib/websocketFunctions';
import { ServerMessage } from '../types/ws';
import { useTranslation } from 'react-i18next';
import { Question, Candidate } from '../types/differentiation_questions';

export function useWebsockets() {
  const { t } = useTranslation();
  const { websocketUrl, socket } = useChatStore();
  const {
    setConnected,
    setSessionId,
    setHistory,
    setSending,
    setErrorMessage,
    addDifferentiationQuestion,
    addCandidate,
  } = useAppStore();

  // Track if we've already initialized to prevent duplicate connections
  const initializedRef = useRef(false);

  useEffect(() => {

    // Prevent duplicate initialization
    if (initializedRef.current) {
      return;
    }

    // If there's already a connected socket, don't create a new one
    if (socket.current?.connected) {
      initializedRef.current = true;
      return;
    }

    // Clean up any existing socket before creating a new one
    if (socket.current) {
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
    }

    const s: Socket = io(websocketUrl, {
      // optionally force websocket to reduce polling churn:
      // transports: ["websocket"], // This is causing issues with the server in production
      // reconnection: true,
    });
    socket.current = s;

    initializedRef.current = true;

    let echoIntervalId: number | null = null;

    function onConnect() {
      setConnected(true);
      setSending(true);
      const sessionId = getSessionId();
      startSession(socket.current, sessionId);
      console.info('Connected to websocket');
      setErrorMessage('');

      echoIntervalId = setInterval(() => {
        safeEmit(socket.current, WS_EVENTS.ECHO, getSessionId());
      }, 120 * 1000);
    }

    function onDisconnect() {
      setConnected(false);
      console.info('Disconnected from websocket');
      setErrorMessage(t('Disconnected from websocket'));
    }

    function onServerMessage(serverMessage: ServerMessage) {
      console.info('Server message: ', serverMessage);
      setErrorMessage('');
      switch (serverMessage.status) {
        case MessageStatus.OK:
          setSessionId(serverMessage.session_id);
          switch (serverMessage.content_type) {
            case ContentType.HISTORY:
              setSending(false);
              setHistory(serverMessage.content?.history ?? []);
              break;
            case ContentType.DIFFERENTIATION_QUESTIONS:
              addDifferentiationQuestion(serverMessage.content as Question);
              break;
            case ContentType.CANDIDATE:
              setSending(false);
              addCandidate(serverMessage.content as Candidate);
              break;
            case ContentType.VOTES_SAVED:
              setSending(false);
              break;
            case ContentType.ERROR:
              setSending(false);
              setErrorMessage(serverMessage.content?.message ?? t('An error occurred.'));
              break;
            default:
              setSending(false);
              console.error('Unknown content type: ', serverMessage.content_type);
          }
          break;
        case MessageStatus.ERROR:
          setSending(false);
          setErrorMessage(serverMessage.content?.message ?? t('An error occurred.'));
          break;
        default:
          setSending(false);
          const error = t('Unknown status', { status: serverMessage.status });
          console.error(error);
          setErrorMessage(error);
      }
    }

    socket.current.on(WS_EVENTS.CONNECT, onConnect);
    socket.current.on(WS_EVENTS.DISCONNECT, onDisconnect);
    socket.current.on(WS_EVENTS.SERVER_MESSAGE, onServerMessage);
    socket.current.on('connect_error', function (err) {
      console.error('client connect_error: ', err);
    });

    socket.current.on('connect_timeout', function (err) {
      console.error('client connect_timeout: ', err);
    });

    return () => {
      initializedRef.current = false;
      if (echoIntervalId) {
        clearInterval(echoIntervalId);
        echoIntervalId = null;
      }
      if (socket.current) {
        socket.current.off(WS_EVENTS.CONNECT, onConnect);
        socket.current.off(WS_EVENTS.DISCONNECT, onDisconnect);
        socket.current.off(WS_EVENTS.SERVER_MESSAGE, onServerMessage);
        socket.current.removeAllListeners();
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [websocketUrl, setErrorMessage, setSending, setSessionId, setHistory, addDifferentiationQuestion, addCandidate, t]);
}