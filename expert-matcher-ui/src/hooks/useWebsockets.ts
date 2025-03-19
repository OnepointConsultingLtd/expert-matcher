import { useChatStore } from '../context/ChatStore';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
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
    errorMessage,
    setErrorMessage,
    addDifferentiationQuestion,
    addCandidate
  } = useAppStore();

  useEffect(() => {
    socket.current = io(websocketUrl);

    function onConnect() {
      setConnected(true);
      setSending(true);
      const sessionId = getSessionId();
      startSession(socket.current, sessionId);
      console.info('Connected to websocket');
      if (errorMessage === t('Disconnected from websocket')) {
        setErrorMessage('');
      }

      setInterval(() => {
        safeEmit(socket.current, WS_EVENTS.ECHO, getSessionId());
      }, 60000);
    }

    function onDisconnect() {
      setConnected(false);
      console.info('Disconnected from websocket');
      setErrorMessage(t('Disconnected from websocket'));
    }

    function onServerMessage(serverMessage: ServerMessage) {
      console.info('Server message: ', serverMessage);
      setSending(false);
      if (serverMessage.status === MessageStatus.OK) {
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
          default:
            console.error('Unknown content type: ', serverMessage.content_type);
        }
      } else {
        console.error('Server message: ', serverMessage);
        setErrorMessage('An error occurred.');
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
      if (socket.current) {
        socket.current.off(WS_EVENTS.CONNECT, onConnect);
        socket.current.off(WS_EVENTS.DISCONNECT, onDisconnect);
        socket.current.off(WS_EVENTS.SERVER_MESSAGE, onServerMessage);
      }
    };
  }, [websocketUrl]);
}
