import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/AppStore';
import { buttonStyle } from './common';
import AvailableConsultants from './AvailableConsultants';

export default function Suggestions() {
  const { t } = useTranslation();
  const { addSelectedSuggestions } = useAppStore();
  const currentMessage = useCurrentMessage();
  if (!currentMessage) return null;
  const { questionSuggestions, selectedSuggestions, isLast, hasDifferentiationQuestions } =
    currentMessage;
  if (!questionSuggestions) return null;
  const { suggestions_count } = questionSuggestions;
  const suggestions = questionSuggestions.suggestions;
  if (hasDifferentiationQuestions) return null;

  return (
    <div className="mt-6">
      <AvailableConsultants />
      <div className="container suggestions animate-fade-down grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-full">
        {suggestions
          .map((suggestion, i) => {
            const isSelected = selectedSuggestions.includes(suggestion);
            return (
              <button
                key={i}
                onClick={() => {
                  if (isLast) {
                    addSelectedSuggestions(suggestion);
                  }
                }}
                className={`suggestion ${buttonStyle} ${isSelected ? 'bg-teal-900' : ''}`}
              >
                <div>{suggestion}</div>
                {suggestions_count[i] > 0 && (
                  <div className={`text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {t('consultantWithCount', { count: suggestions_count[i] })}
                  </div>
                )}
                {suggestions_count[i] <= 0 && <br />}
              </button>
            );
          })}
      </div>
    </div>
  );
}
