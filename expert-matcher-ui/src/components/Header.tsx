import HamburgerMenu from './menu/HamburgerMenu';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/AppStore';

export default function Header() {
  const { t } = useTranslation();
  const imageAlt = t('Expert Matcher logo');
  const { darkMode } = useAppStore();

  return (
    <div className="header min-h-14 pt-2 md:pt-3 pb-2 flex items-center w-full">
      <div className="header-container w-full min-h-14 pt-2 md:pt-3 pb-2 flex items-center justify-between">
        <div className="flex flex-row items-end">
          <img
            className="w-52 lg:w-72"
            src={darkMode ? '/images/expertmatcher-white.png' : '/images/expertmatcher-black.png'}
            alt={imageAlt}
          />
        </div>
        <div className="flex items-center">
          <HamburgerMenu />
        </div>
      </div>
    </div>
  );
}
