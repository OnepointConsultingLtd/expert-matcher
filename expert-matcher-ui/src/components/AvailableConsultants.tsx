import { useTranslation } from "react-i18next";
import { useAppStore } from "../context/AppStore";
import { useCurrentMessage } from "../hooks/useCurrentMessage";


export default function AvailableConsultants() {
    const { t } = useTranslation();
    const { connected, sending } = useAppStore();
    const { isLast, questionSuggestions } = useCurrentMessage()
    if (!connected || sending || !isLast || !questionSuggestions) {
        return null
    }
    return (
        <div className="flex flex-col mb-2">
            <p className="text-sm">
            {t("availableConsultants", { count: questionSuggestions.available_consultants_count })}</p>
        </div>
    )
}
