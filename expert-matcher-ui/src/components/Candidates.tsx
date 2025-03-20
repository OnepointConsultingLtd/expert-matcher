import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { CandidateWithVotes } from '../types/differentiation_questions';
import { VscAccount } from 'react-icons/vsc';
import { IoIosContact } from 'react-icons/io';

function OptionalLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (!href) {
    return children;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function CandidatePhoto({ candidate }: { candidate: CandidateWithVotes }) {
  if (candidate.photo_url_400) {
    return (
      <OptionalLink href={candidate.linkedin_profile_url}>
        <img src={candidate.photo_url_400} alt={name ?? ''} className="w-full" />
      </OptionalLink>
    );
  }
  return (
    <OptionalLink href={candidate.linkedin_profile_url}>
      <VscAccount className="w-full h-full" />
    </OptionalLink>
  );
}

function CadidateCard({ candidate }: { candidate: CandidateWithVotes }) {
  const { t } = useTranslation();
  const name = `${candidate.given_name} ${candidate.surname}`;
  const { linkedin_profile_url } = candidate;
  return (
    <div key={candidate.id} className="flex flex-col gap-2">
      <div className="text-2xl">{name}</div>
      <CandidatePhoto
        candidate={candidate}
      />
      <div className="text-xl pl-1">{t('vote_other', { count: candidate.votes })}</div>
      {linkedin_profile_url && (
        <div className="flex flex-row gap-2 items-center text-xl">
          <a
            href={linkedin_profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row items-center transition duration-300 ease-in-out hover:underline"
          >
            <IoIosContact className="h-7 w-7 mr-2" />
            {t('Online profile')}
          </a>
        </div>
      )}
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
        {candidates
          .sort((a, b) => b.votes - a.votes)
          .map((candidate) => (
            <CadidateCard key={candidate.id} candidate={candidate} />
          ))}
      </div>
    </div>
  );
}
