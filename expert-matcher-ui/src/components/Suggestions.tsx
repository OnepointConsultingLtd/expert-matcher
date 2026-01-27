import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/AppStore';
import { buttonStyle } from './common';
import AvailableConsultants from './AvailableConsultants';
import { FiSearch } from 'react-icons/fi';

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

  const filteredSuggestions = suggestions.filter(
    (s) => s.length === 0 || s.toLowerCase().includes(suggestionFilter.toLowerCase())
  );

  return (
    <div className="mt-0">
      {filteredSuggestions.length > 0 && <AvailableConsultants />}
      {/* <div className="flex flex-row justify-left mb-6 border border-[#636565] rounded-md p-2 gap-2 max-w-1/2">
        <span className="text-gray-[#636565] my-auto pointer-events-none">
          <FiSearch className="w-4 h-4" aria-hidden="true" />
        </span>
        <input
          type="search"
          value={suggestionFilter}
          onChange={(e) => setSuggestionFilter(e.target.value)}
          placeholder={t('Search suggestions')}
          className="w-full focus:outline-none bg-transparent"
        ></input>
      </div> */}

      {filteredSuggestions.length === 0 && suggestionFilter.length > 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          {t('No experts found')}
        </div>
      ) : (
        <div className="container suggestions animate-fade-down grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-full">
          {filteredSuggestions.map((suggestion, i) => {
            const isSelected = selectedSuggestions.includes(suggestion);
            const originalIndex = suggestions.indexOf(suggestion);
            return (
              <button
                key={i}
                onClick={() => {
                  if (isLast) {
                    addSelectedSuggestions(suggestion);
                  }
                }}
                className={`suggestion p-2 ${buttonStyle} ${isSelected ? 'bg-[#9A19FF] border border-[#9A19FF] text-[#fafffe]' : 'border border-[#636565] dark:border-[#fafffe]'}`}
              >
                <div>{suggestion}</div>
                {suggestions_count[originalIndex] > 0 && (
                  <div
                    className={`text-sm ${isSelected ? 'text-[#fafffe]' : 'text-[#636565] dark:text-[#fafffe]'}`}
                  >
                    {t('consultantWithCount', { count: suggestions_count[originalIndex] })}
                  </div>
                )}
                {suggestions_count[originalIndex] <= 0 && <br />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
