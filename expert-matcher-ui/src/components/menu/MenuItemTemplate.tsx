import { useTranslation } from 'react-i18next';

export default function MenuItemTemplate({
  title,
  func,
  children,
}: {
  title: string;
  func: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="menu-item w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#38333d] transition-colors duration-200 cursor-pointer"
      onClick={func}
    >
      <div className="">{children}</div>
      <div className="pl-4">
        <button>{t(title)}</button>
      </div>
    </div>
  );
}
