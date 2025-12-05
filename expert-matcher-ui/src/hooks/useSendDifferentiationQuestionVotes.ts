import { useAppStore } from '../context/AppStore';

export function useSendDifferentiationQuestionVotes() {
  const { differentiationQuestions, setSending } = useAppStore();
  const votes = differentiationQuestions
    .map((dq) => dq.selectedOptions.length)
    .reduce((a, b) => a + b, 0);

  return { votes, setSending };
}
