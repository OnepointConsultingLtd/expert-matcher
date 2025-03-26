import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/AppStore';
import AvailableConsultants from './AvailableConsultants';
import { buttonStyle } from './common';

export default function Suggestions() {
  const { t } = useTranslation();
  const { addSelectedSuggestions, suggestionFilter, setSuggestionFilter } = useAppStore();
  const currentMessage = useCurrentMessage();
  if (!currentMessage) return null;
  const { questionSuggestions, selectedSuggestions, isLast, displayRegularQuestions } =
    currentMessage;
  if (!questionSuggestions) return null;
  const { suggestions_count } = questionSuggestions;
  const suggestions = questionSuggestions.suggestions;
  if (!displayRegularQuestions) return null;

  return (
    <div className="mt-0">
      <div className="flex flex-row justify-left mb-2">
        <input
          type="search"
          value={suggestionFilter}
          onChange={(e) => setSuggestionFilter(e.target.value)}
          placeholder={t('Search suggestions')}
          className="border-2 border-gray-300 rounded-md p-2 w-full max-w-1/2"
        ></input>
      </div>
      <AvailableConsultants />
      <div className="container suggestions animate-fade-down grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-full">
        {suggestions
          .filter((s) => s.length === 0 || s.toLowerCase().includes(suggestionFilter.toLowerCase()))
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
