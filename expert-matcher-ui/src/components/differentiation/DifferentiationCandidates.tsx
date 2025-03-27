import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import { CandidateWithVotes } from '../../types/differentiation_questions';
import { VscAccount } from 'react-icons/vsc';
import { IoIosContact } from 'react-icons/io';
import { TbFileCv } from 'react-icons/tb';
import { useEffect, useRef, useState } from 'react';
import { scrollToElement } from '../../lib/scrollSupport';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoTrophy } from 'react-icons/go';
import { GrUserExpert } from "react-icons/gr";
import { iconClass } from '../common';
import { useAppStore } from '../../context/AppStore';
import { getExpertMatcherProfile } from '../../lib/apiClient';
import { DynamicConsultantProfile } from '../../types/dynamic_consultant_profile';

const candidateTextCss = 'flex flex-row items-center transition duration-300 ease-in-out hover:underline';

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

function CandidateCv({ candidate }: { candidate: CandidateWithVotes }) {
  const { t } = useTranslation();
  const [cvExpanded, setCvExpanded] = useState(true);

  return (
    <>
      {candidate.cv_summary && (
        <div>
          <button
            id={`${candidate.id}`}
            className={candidateTextCss}
            onClick={() => {
              const newExpanded = !cvExpanded;
              setCvExpanded(newExpanded);
              if (newExpanded) {
                const elementId = document.getElementById(`${candidate.id}`);
                if (elementId) {
                  setTimeout(() => {
                    scrollToElement(elementId);
                  }, 400);
                }
              }
            }}
          >
            <TbFileCv className={iconClass} />
            {t('CV')}
          </button>
          <div
            className={`text-sm overflow-hidden transition-all duration-300 ease-in-out ml-1 ${cvExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
          >
            <Markdown remarkPlugins={[remarkGfm]}>{candidate.cv_summary}</Markdown>
          </div>
        </div>
      )}
    </>
  );
}

function ExpertMatcherProfile({ candidate }: { candidate: CandidateWithVotes }) {
  const { t } = useTranslation();
  const mdCache = useRef<Map<number, string>>(new Map);
  const { overlaySetTitle, overlaySetContent, overlaySetOpen, overlaySetError } = useAppStore();
  if (!candidate) {
    return null;
  }
  const { given_name, surname } = candidate;

  useEffect(() => {
    mdCache.current.clear();
  }, [candidate.votes]);
  
  return (
    <div className="flex flex-row gap-2 items-center text-xl">
      <button onClick={() => {
        const title = `${given_name} ${surname}`;
        overlaySetTitle(title);
        overlaySetContent(``);
        overlaySetOpen();
        if (candidate.email) {
          if (mdCache.current.has(candidate.id)) {
            overlaySetContent(mdCache.current.get(candidate.id)!);
          } else {
            getExpertMatcherProfile(candidate.email)
              .then((data: DynamicConsultantProfile) => {
                const { profile, matching_items } = data;
                const photoMd = candidate.photo_url_200 ? `![${title}](${candidate.photo_url_200} "${title}")` : '';
                const markdown = `${photoMd}
              
${t("vote", { count: candidate.votes })}
              
${profile}

### Relevant Questions
${matching_items.map((item) => `- ${item.question}: ${item.answer}`).join('\n')}
            `;
                mdCache.current.set(candidate.id, markdown);
                overlaySetContent(markdown);
              })
              .catch((error) => {
                overlaySetError(t('Error fetching expert matcher profile', { error: error.message }));
              });
          }
        }

      }}
        className={candidateTextCss}
      >
        <GrUserExpert className={`${iconClass} ml-1`} />
        {t('Expert matcher profile')}
      </button>
    </div>
  );
}

function OnlineProfile({ candidate }: { candidate: CandidateWithVotes }) {
  const { t } = useTranslation();
  const { linkedin_profile_url } = candidate;
  if (!linkedin_profile_url) {
    return null;
  }
  return (
    <div className="flex flex-row gap-2 items-center text-xl">
      <a
        href={linkedin_profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-row items-center transition duration-300 ease-in-out hover:underline"
      >
        <IoIosContact className={iconClass} />
        {t('Online profile')}
      </a>
    </div>
  );
}

function VoteDisplay({ candidate }: { candidate: CandidateWithVotes }) {
  const { t } = useTranslation();
  return (
    <div className="text-xl pl-1">{t('vote_other', { count: candidate.votes })}</div>
  );
}

function CadidateCard({ candidate, maxVote }: { candidate: CandidateWithVotes; maxVote: number }) {
  const { t } = useTranslation();
  const name = `${candidate.given_name} ${candidate.surname}`;
  return (
    <div key={candidate.id} className="flex flex-col gap-2">
      <div className="flex flex-row items-center text-2xl gap-2">
        {name}{' '}
        {candidate.votes > 0 && candidate.votes === maxVote && <GoTrophy className={iconClass} title={t('Best match')} />}
      </div>
      <CandidatePhoto candidate={candidate} />
      <VoteDisplay candidate={candidate} />
      <ExpertMatcherProfile candidate={candidate} />
      <OnlineProfile candidate={candidate} />
      <CandidateCv candidate={candidate} />
    </div>
  );
}

export default function DifferentiationCandidates() {
  const { t } = useTranslation();
  const { candidates } = useCurrentMessage();
  const maxVote = Math.max(...candidates.map((c) => c.votes));
  return (
    <div className="dark:text-gray-100 mt-4">
      <p className="w-full text-xl">{t('Candidates')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-full">
        {candidates
          .sort((a, b) => b.votes - a.votes)
          .map((candidate) => (
            <CadidateCard key={candidate.id} candidate={candidate} maxVote={maxVote} />
          ))}
      </div>
    </div>
  );
}
