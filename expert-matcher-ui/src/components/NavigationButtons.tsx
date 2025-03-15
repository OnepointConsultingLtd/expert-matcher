import { useTranslation } from "react-i18next";
import { useAppStore } from "../context/AppStore";
import { buttonStyle } from "./common";
import { useHandleNext } from "../hooks/useHandleNext";
import { MdOutlineArrowForwardIos, MdOutlineArrowBackIos } from "react-icons/md";
import { useCurrentMessage } from "../hooks/useCurrentMessage";

export default function NavigationButtons() {
    const { t } = useTranslation();
    const { selectAllSuggestions, deselectAllSuggestions, sending, previousQuestion, currentIndex } = useAppStore();
    const { handleNext } = useHandleNext();
    const { selectedSuggestions, isLast } = useCurrentMessage();

    return (
        <div className="flex justify-between mt-6">
            <div>
                <button className={buttonStyle} onClick={() => deselectAllSuggestions()} disabled={sending || !isLast}>{t("Deselect all")}</button>
                <button className={`${buttonStyle} ml-2`} onClick={() => selectAllSuggestions()} disabled={sending || !isLast}>{t("Select all")}</button>
            </div>
            <div className="flex flex-row">
                <button className={`${buttonStyle} ml-2 flex`} onClick={() => previousQuestion()} disabled={sending || currentIndex === 0}>
                    <MdOutlineArrowBackIos className="md:mr-2 h-6 w-6" />
                    <span className="hidden md:inline">{t("Previous")}</span>
                </button>
                <button className={`${buttonStyle} ml-2 flex`} onClick={() => handleNext()} disabled={sending || selectedSuggestions.length === 0}>
                    <MdOutlineArrowForwardIos className="md:mr-2 h-6 w-6" />
                    <span className="hidden md:inline">{t("Next")}</span>
                </button>
            </div>
        </div>
    )
}
