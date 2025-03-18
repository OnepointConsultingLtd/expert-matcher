import { useTranslation } from 'react-i18next';

const Spinner = ({ className = `h-24 w-24` }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <div role="status">
      <img
        src="/images/D-Well_Icons_one_frame.gif"
        alt={t('Please wait')}
        title={t('Please wait')}
        className={className}
      />
    </div>
  );
};

export default Spinner;
