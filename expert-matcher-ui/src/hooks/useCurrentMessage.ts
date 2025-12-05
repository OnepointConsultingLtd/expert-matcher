import { useAppStore } from '../context/AppStore';

export function useCurrentMessage() {
  const {
    history,
    currentIndex,
    selectedSuggestions,
    differentiationQuestions,
    candidates,
    sending,
  } = useAppStore();
  const hasDifferentiationQuestions = differentiationQuestions.length > 0;
  const historyLength = history?.length + (hasDifferentiationQuestions ? 1 : 0);
  const displayRegularQuestions =
    !sending &&
    (!hasDifferentiationQuestions ||
      (hasDifferentiationQuestions && currentIndex + 1 < historyLength));
  if (!history || currentIndex === null || currentIndex < 0 || !history[currentIndex]) {
    return {
      questionSuggestions: null,
      selectedSuggestions: [],
      isLast: false,
      hasDifferentiationQuestions,
      differentiationQuestions,
      candidates,
      historyLength,
      displayRegularQuestions,
    };
  }
  const currentSelectedSuggestions =
    currentIndex + 1 === historyLength
      ? selectedSuggestions
      : (history[currentIndex].selected_suggestions ?? []);
  return {
    questionSuggestions: history[currentIndex],
    selectedSuggestions: currentSelectedSuggestions,
    isLast: currentIndex === historyLength - 1,
    hasDifferentiationQuestions,
    differentiationQuestions,
    candidates,
    historyLength,
    displayRegularQuestions,
  };
}
