import { useAppStore } from "../context/AppStore";
import { useChatStore } from "../context/ChatStore";
import { getSessionId } from "../lib/sessionFunctions";
import { sendClientResponse } from "../lib/websocketFunctions";
import { ClientResponse } from "../types/ws";
import { useCurrentMessage } from "./useCurrentMessage";

export function useHandleNext() {
    const { socket } = useChatStore();
    const currentMessage = useCurrentMessage();
    const { selectedSuggestions, setSending, nextQuestion } = useAppStore();

    function handleNext() {
        const sessionId = getSessionId();
        const question = currentMessage.questionSuggestions?.question;
        const isLast = currentMessage.isLast;
        if(!isLast) {
            nextQuestion();
        }
        else if (sessionId && currentMessage && question) {
            setSending(true);
            const clientResponse: ClientResponse = {
                session_id: sessionId,
                question,
                response_items: selectedSuggestions,
            };
            sendClientResponse(socket.current, clientResponse);
            // echo(socket.current, JSON.stringify(clientResponse));
        } else {
            if(!sessionId) {
                console.error("Session ID not found");
            } else if (!currentMessage) {
                console.error("Current message not found");
            }
        }
    }

    return { handleNext };
}
