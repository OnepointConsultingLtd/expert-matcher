import { useAppStore } from '../context/AppStore';
import { useChatStore } from '../context/ChatStore';
import { deleteSession } from '../lib/sessionFunctions';
import { startSession } from '../lib/websocketFunctions';

export function useRestart() {
  const { deselectAllSuggestions, clearDifferentiationQuestions, setErrorMessage, setSuccessMessage } = useAppStore();
  const { socket } = useChatStore();

  function onRestart() {
    deselectAllSuggestions();
    clearDifferentiationQuestions();
    deleteSession();
    setErrorMessage("");
    setSuccessMessage("");
    startSession(socket.current, null);
  }

  return { onRestart };
}
