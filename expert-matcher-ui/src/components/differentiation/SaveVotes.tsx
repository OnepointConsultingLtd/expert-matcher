import { useTranslation } from 'react-i18next';
import { useSendDifferentiationQuestionVotes } from '../../hooks/useSendDifferentiationQuestionVotes';
import { buttonStyle } from '../common';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { getSessionId } from '../../lib/sessionFunctions';

export default function SaveVotes() {

  const { votes } = useSendDifferentiationQuestionVotes();
  const { t } = useTranslation();
  const sessionId = getSessionId();

  if (!sessionId || !votes) return null;

  const url = `/api/report-consultants/${sessionId}`;

  return (
    <div className="flex flex-row justify-between items-center mt-6">
      <div className="text-sm">
        {t('saveVotes', { count: votes })}
      </div>
      <button 
        className={`${buttonStyle} flex flex-row items-center gap-2`}
        onClick={() => window.open(url, '_blank')}
      >
        <HiOutlineDocumentReport className="w-6 h-6"/> {t('Download report')}
      </button>
    </div>
  );
}
