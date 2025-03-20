import { useTranslation } from 'react-i18next';

const Spinner = ({
  className = `h-24 w-24`,
  message = 'Please wait',
}: {
  className?: string;
  message?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div role="status" className="flex flex-col items-center justify-center">
      <img
        src="/images/D-Well_Icons_one_frame.gif"
        alt={t('Please wait')}
        title={t('Please wait')}
        className={className}
      />
      <div className="text-sm">{t(message)}</div>
    </div>
  );
};

export default Spinner;
