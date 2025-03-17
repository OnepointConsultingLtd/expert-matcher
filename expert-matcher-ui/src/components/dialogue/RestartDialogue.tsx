import { useTranslation } from "react-i18next";
import { useRestart } from "../../hooks/useRestart";
import onCloseDialogue from "../../lib/dialogueFunctions";
import DialogueHeader from "./DialogueHeader";
import DialogueBody from "./DialogueBody";
import ButtonPanel from "./ButtonPanel";

export const RESTART_DIALOGUE_ID = "restart-dialogue";

function onClose() {
    onCloseDialogue(RESTART_DIALOGUE_ID);
}

export default function RestartDialogue() {

    const { onRestart } = useRestart();
    const { t } = useTranslation();

    return (
        <dialog
            data-model={true}
            id={RESTART_DIALOGUE_ID}
            className="companion-dialogue w-11/12 md:w-1/2 bg-white shadow-lg max-w-3xl outline-0 rounded-lg dark:bg-gray-700 dark:text-white"
        >
            <DialogueHeader onClose={onClose}>
                <svg
                    width="54"
                    height="54"
                    viewBox="0 0 54 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        width="54"
                        height="54"
                        fill="url(#paint0_linear_1095_3)"
                        fillOpacity="0.6"
                    />
                    <rect
                        x="6.75"
                        y="6.75"
                        width="40.5"
                        height="40.5"
                        fill="url(#paint1_linear_1095_3)"
                    />
                    <g clipPath="url(#clip0_1095_3)">
                        <path
                            d="M25.578 26.4783V18.2412C25.578 17.3322 26.3164 16.5938 27.2255 16.5938C28.1345 16.5938 28.8729 17.3322 28.8729 18.2412V26.4783C28.8729 27.3873 28.1345 28.1257 27.2255 28.1257C26.3164 28.1257 25.578 27.3873 25.578 26.4783ZM33.7556 19.0093C33.222 18.5868 32.4433 18.6795 32.0207 19.2141C31.5982 19.7495 31.69 20.5264 32.2255 20.9498C34.1852 22.4958 35.3086 24.8107 35.3086 27.3024C35.3086 31.7591 31.6822 35.3856 27.2263 35.3856C22.7696 35.3856 19.1432 31.7591 19.1432 27.3024C19.1432 24.8116 20.2657 22.4975 22.2237 20.9525C22.7591 20.5299 22.851 19.753 22.4284 19.2167C22.0058 18.6812 21.2298 18.5903 20.6926 19.012C18.1371 21.0286 16.6716 24.0505 16.6716 27.3024C16.6716 33.1222 21.4065 37.8563 27.2255 37.8563C33.0444 37.8563 37.7793 33.1213 37.7793 27.3024C37.7793 24.0487 36.3121 21.0268 33.7556 19.0093Z"
                            fill="white"
                        />
                    </g>
                    <defs>
                        <linearGradient
                            id="paint0_linear_1095_3"
                            x1="1.95652"
                            y1="-3.43431e-07"
                            x2="52.0435"
                            y2="54"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#0084D7" />
                            <stop offset="1" stopColor="#4DC48D" />
                        </linearGradient>
                        <linearGradient
                            id="paint1_linear_1095_3"
                            x1="8.21739"
                            y1="6.75"
                            x2="45.7826"
                            y2="47.25"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#0084D7" />
                            <stop offset="1" stopColor="#4DC48D" />
                        </linearGradient>
                        <clipPath id="clip0_1095_3">
                            <rect
                                width="21.2625"
                                height="21.2625"
                                fill="white"
                                transform="translate(16.5938 16.5938)"
                            />
                        </clipPath>
                    </defs>
                </svg>
            </DialogueHeader>
            <DialogueBody>{t("Would you like to restart the expert matcher?")}</DialogueBody>
            <ButtonPanel onOk={() => {onRestart(); onClose()}} okText={t("Restart")} disabled={false} />
        </dialog>
    )
}