import { useAppStore } from '../context/AppStore';
import { useChatStore } from '../context/ChatStore';
import { getSessionId } from '../lib/sessionFunctions';
import { sendDifferentiationQuestionVotesWs } from '../lib/websocketFunctions';
import {
  DifferentiationQuestionVotes,
  DifferentiationQuestionVote,
} from '../types/differentiation_questions';

export function useSendDifferentiationQuestionVotes() {
  const { socket } = useChatStore();
  const { differentiationQuestions, setSending } = useAppStore();
  const votes = differentiationQuestions
    .map((dq) => dq.selectedOptions.length)
    .reduce((a, b) => a + b, 0);
  function sendDifferentiationQuestionVotes() {
    const sessionId = getSessionId();
    if (sessionId) {
      const votes: DifferentiationQuestionVote[] = differentiationQuestions.flatMap((dq) => {
        return dq.selectedOptions.map((so) => {
          return {
            question: dq.question,
            option: so.option,
          };
        });
      });
      const differentiationQuestionVotes: DifferentiationQuestionVotes = {
        session_id: sessionId,
        votes,
      };
      sendDifferentiationQuestionVotesWs(socket.current, differentiationQuestionVotes);
    }
  }

  return { sendDifferentiationQuestionVotes, votes, setSending };
}
