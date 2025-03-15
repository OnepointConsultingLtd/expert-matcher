import HamburgerMenu from "./menu/HamburgerMenu";
import { useTranslation } from "react-i18next";

export default function Header() {
    const { t } = useTranslation();
    const imageAlt = t("D-Well logo");
    return (
        <div className="header min-h-14 pt-2 md:pt-3 pb-2 flex items-center w-full">
            <div className="header-container w-full min-h-14 pt-2 md:pt-3 pb-2 flex items-center justify-between">
                <div className="flex flex-row items-end">
                    <img className="w-52 lg:w-72" src="/images/logo.svg" alt={imageAlt} />
                </div>
                <HamburgerMenu />
            </div>
        </div>
    )
}
