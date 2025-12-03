import { LuMoon } from 'react-icons/lu';
import { useAppStore } from '../../context/AppStore';
import { useTranslation } from 'react-i18next';

export default function DarkModeButton() {
  const { darkMode, setDarkMode } = useAppStore();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#38333d] transition-colors duration-200"
      aria-label={t('Toggle Dark Mode')}
      title={t('Toggle Dark Mode')}
    >
      <LuMoon className="w-6 h-6 text-[#07000d] dark:text-[#fafffe]" />
      <div className="ml-3 text-left">
        <div className="font-medium">{t('Dark mode')}</div>
      </div>

      <div className="ml-auto">
        <label
          // prevent clicks inside the toggle from bubbling up to the button (avoids double toggle)
          onClick={(e) => e.stopPropagation()}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            type="checkbox"
            className="sr-only peer"
            checked={darkMode}
            onChange={(ev) => setDarkMode(ev.target.checked)}
            onClick={(e) => e.stopPropagation()} // extra guard
            aria-checked={darkMode}
            aria-label={t('Dark mode toggle')}
          />
          <div className="w-11 h-6 bg-[#6A666D45] peer-focus:ring-2 peer-focus:ring-[#6A666D45] rounded-full peer peer-checked:bg-[#9A19FF] transition-colors" />
          <span className={`absolute left-1 top-1 w-4 h-4 bg-[#fafffe] rounded-full shadow transform transition ${darkMode ? 'translate-x-5' : ''}`} />
        </label>
      </div>
    </button>
  );
}