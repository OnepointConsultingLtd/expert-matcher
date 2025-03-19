import { useAppStore } from '../context/AppStore';

export function useCurrentMessage() {
  const { history, currentIndex, selectedSuggestions, differentiationQuestions, candidates } = useAppStore();
  if (!history || currentIndex === null || currentIndex < 0 || !history[currentIndex]) {
    return {
      questionSuggestions: null,
      selectedSuggestions: [],
      isLast: false,
      hasDifferentiationQuestions: differentiationQuestions.length > 0,
      differentiationQuestions,
      candidates
    };
  }
  const currentSelectedSuggestions =
    currentIndex === history.length - 1
      ? selectedSuggestions
      : (history[currentIndex].selected_suggestions ?? []);
  return {
    questionSuggestions: history[currentIndex],
    selectedSuggestions: currentSelectedSuggestions,
    isLast: currentIndex === history.length - 1,
    hasDifferentiationQuestions: differentiationQuestions.length > 0,
    differentiationQuestions,
    candidates
  };
}
