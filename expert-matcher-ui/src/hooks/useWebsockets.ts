import { useChatStore } from '../context/ChatStore';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../context/AppStore';
import { ContentType, MessageStatus, WS_EVENTS } from '../types/ws';
import { getSessionId } from '../lib/sessionFunctions';
import { startSession } from '../lib/websocketFunctions';
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

    initializedRef.current = true;

    // Create socket inside useEffect using websocketUrl from store
    const s: Socket = io(websocketUrl, {
      // Force websocket transport to reduce HTTP polling and rate limit issues
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    
    socket.current = s;

    function onConnect() {
      setConnected(true);
      setSending(true);
      const sessionId = getSessionId();
      startSession(socket.current, sessionId);
      console.info('Connected to websocket');
      // Clear disconnect error message on successful connection
      setErrorMessage('');
    }

    function onDisconnect() {
      setConnected(false);
      setSending(false);
      console.info('Disconnected from websocket');
      setErrorMessage(t('Disconnected from websocket'));
    }

    function onServerMessage(serverMessage: ServerMessage) {
      console.info('Server message: ', serverMessage);
      setSending(false);
      // Clear any previous error messages on successful message
      switch (serverMessage.status) {
        case MessageStatus.OK:
          setSessionId(serverMessage.session_id);
          switch (serverMessage.content_type) {
            case ContentType.HISTORY:
              setHistory(serverMessage.content?.history ?? []);
              break;
            case ContentType.DIFFERENTIATION_QUESTIONS:
              addDifferentiationQuestion(serverMessage.content as Question);
              break;
            case ContentType.CANDIDATE:
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
              console.error('Unknown content type: ', serverMessage.content_type);
          }
          break;
        case MessageStatus.ERROR:
          setSending(false);
          setErrorMessage(serverMessage.content?.message ?? t('An error occurred.'));
          break;
        default:
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
      if (socket.current) {
        socket.current.off(WS_EVENTS.CONNECT, onConnect);
        socket.current.off(WS_EVENTS.DISCONNECT, onDisconnect);
        socket.current.off(WS_EVENTS.SERVER_MESSAGE, onServerMessage);
        socket.current.off('connect_error');
        socket.current.off('connect_timeout');
        socket.current.removeAllListeners();
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [websocketUrl, setConnected, setSending, setSessionId, setHistory, setErrorMessage, addDifferentiationQuestion, addCandidate, t]);
}
