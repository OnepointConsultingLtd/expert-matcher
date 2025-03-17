import { useCurrentMessage } from "../hooks/useCurrentMessage";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../context/AppStore";
import { buttonStyle } from "./common";

export default function Suggestions() {
    const { t } = useTranslation();
    const { addSelectedSuggestions } = useAppStore();
    const currentMessage = useCurrentMessage();
    if (!currentMessage) return null;
    const { questionSuggestions, selectedSuggestions, isLast } = currentMessage;
    if(!questionSuggestions) return null;
    const { suggestions_count } = questionSuggestions;

    return (
        <div>
            <div className="container suggestions animate-fade-down mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-w-full">
                {questionSuggestions.suggestions.map((suggestion, i) => {
                    const isSelected = selectedSuggestions.includes(suggestion)
                    return (
                        <button key={i} 
                            onClick={() => {
                                if(isLast) {
                                    addSelectedSuggestions(suggestion)
                                }
                            }}
                            className={`suggestion ${buttonStyle} ${isSelected ? 'bg-teal-900' : ''}`}>
                            <div>{suggestion}</div>
                            {suggestions_count[i] > 0 && <div className={`text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                {t("consultantWithCount", { count: suggestions_count[i] })}
                            </div>}
                            {suggestions_count[i] <= 0 && <br />}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
