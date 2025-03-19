import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { CandidateWithVotes } from '../types/differentiation_questions';

function CadidateCard({ candidate }: { candidate: CandidateWithVotes }) {
    const { t } = useTranslation();
  const name = `${candidate.given_name} ${candidate.surname}`;
  return (
    <div key={candidate.id} className="flex flex-col gap-2">
      <div className="text-2xl">{name}</div>
      <img src={candidate.photo_url_400} alt={name} className="w-full" />
      <div className="text-xl">{t('vote_other', { count: candidate.votes })}</div>
    </div>
  );
}

export default function Candidates() {
  const { t } = useTranslation();
  const { hasDifferentiationQuestions, candidates } = useCurrentMessage();
  if (!hasDifferentiationQuestions) return null;
  return (
    <div className="dark:text-gray-100 mt-4">
      <p className="w-full text-xl">{t('Candidates')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-full">
        {candidates.sort((a, b) => b.votes - a.votes).map((candidate) => (
          <CadidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
