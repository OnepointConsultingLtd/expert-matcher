import { useTranslation } from 'react-i18next';
import { useSendDifferentiationQuestionVotes } from '../../hooks/useSendDifferentiationQuestionVotes';
import { buttonStyle } from '../common';
import { scrollToTop } from '../../lib/scrollSupport';

export default function SaveVotes() {
  const { sendDifferentiationQuestionVotes, votes, setSending } =
    useSendDifferentiationQuestionVotes();
  const { t } = useTranslation();
  const handleSaveVotes = () => {
    setSending(true);
    sendDifferentiationQuestionVotes();
    scrollToTop();
  };
  return (
    <div className="flex flex-row justify-center items-center mt-3">
      <button
        className={`${buttonStyle} w-full !text-center`}
        onClick={handleSaveVotes}
        disabled={votes === 0}
      >
        {t('saveVotes', { count: votes })}
      </button>
    </div>
  );
}
