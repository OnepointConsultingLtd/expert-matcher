import { Trans } from 'react-i18next';
import { useAppStore } from '../context/AppStore';

export default function Disclaimer() {
  const { connected } = useAppStore();
  if (!connected) return null;

  return (
    <div className="flex flex-row justify-center mt-auto w-full text-gray-500 align-middle disclaimer text-sm my-5 dark:text-gray-100">
      <p>
        <Trans
          key="disclaimer"
          i18nKey="disclaimer"
          components={{ anchor: <a />, bold: <strong />, underline: <u /> }}
        />
      </p>
    </div>
  );
}
