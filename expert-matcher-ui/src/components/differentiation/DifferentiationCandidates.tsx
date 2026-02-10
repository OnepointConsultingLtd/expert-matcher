import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import { CandidateWithVotes } from '../../types/differentiation_questions';
import { VscAccount } from 'react-icons/vsc';
import { IoIosGlobe } from 'react-icons/io';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoTrophy } from 'react-icons/go';
import { iconClass } from '../common';
import { useAppStore } from '../../context/AppStore';
import { getExpertMatcherProfile } from '../../lib/apiClient';
import { DynamicConsultantProfile } from '../../types/dynamic_consultant_profile';

const candidateTextCss =
  'flex flex-row items-center transition duration-300 ease-in-out hover:underline underline cursor-pointer';

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
        <img
          src={candidate.photo_url_400}
          alt={name ?? ''}
          className="w-20 rounded-full aspect-square object-cover"
        />
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
  const [cvExpanded] = useState(true);

  return (
    <>
      {candidate.cv_summary && (
        <div>
          <div
            className={`text-base overflow-hidden transition-all duration-300 ease-in-out ml-1 ${cvExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
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
  const mdCache = useRef<Map<number, string>>(new Map());
  const { overlaySetTitle, overlaySetContent, overlaySetOpen, overlaySetError } = useAppStore();
  if (!candidate) {
    return null;
  }
  const { given_name, surname } = candidate;

  useEffect(() => {
    mdCache.current.clear();
  }, [candidate.votes]);

  function handleClick() {
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
            const photoMd = candidate.photo_url_200
              ? `![${title}](${candidate.photo_url_200} "${title}")`
              : '';
            const markdown = `${photoMd}
            
${t('vote', { count: candidate.votes })}
            
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
  }

  return (
    <div className="flex flex-row gap-2 items-center text-xl">
      <button onClick={handleClick} className={candidateTextCss} title="Expert Matcher profile">
        <svg
          className={`${iconClass} p-[3px] ml-1`}
          viewBox="0 0 1200 1200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g clipPath="url(#clip0_6695_10)">
            <path
              d="M600.001 37.5C716.575 37.5 782.359 57.4133 820.676 95.7305C858.993 134.048 878.905 199.831 878.905 316.405C878.905 432.98 858.993 498.763 820.676 537.08C782.359 575.397 716.575 595.31 600.001 595.31C483.427 595.31 417.643 575.397 379.326 537.08C341.009 498.763 321.096 432.98 321.096 316.405C321.096 199.831 341.009 134.048 379.326 95.7305C417.643 57.4132 483.427 37.5 600.001 37.5Z"
              stroke="#9A19FF"
              strokeWidth={75}
            />
            <path
              d="M600 710.464C802.585 710.464 932.869 741.592 1015.92 808.293C1096.66 873.13 1141.5 978.943 1154.57 1152.1L1154.87 1156.21C1154.88 1156.33 1154.87 1156.38 1154.87 1156.39C1154.87 1156.4 1154.86 1156.41 1154.86 1156.42C1154.84 1156.46 1154.79 1156.59 1154.62 1156.76C1154.46 1156.94 1154.25 1157.08 1154.03 1157.18C1153.84 1157.26 1153.6 1157.33 1153.21 1157.33H46.7852C46.4046 1157.33 46.1555 1157.26 45.9668 1157.18C45.7467 1157.08 45.5401 1156.94 45.376 1156.76C45.2139 1156.59 45.156 1156.46 45.1426 1156.42C45.1368 1156.41 45.1345 1156.4 45.1328 1156.39C45.1316 1156.38 45.1241 1156.33 45.1328 1156.21C57.7941 980.612 102.705 873.641 184.075 808.293C266.482 742.113 395.382 710.952 595.265 710.469L600 710.464Z"
              stroke="currentColor"
              strokeWidth={85.3331}
              strokeLinecap="round"
            />
          </g>
        </svg>
      </button>
    </div>
  );
}

function OnlineProfile({ candidate }: { candidate: CandidateWithVotes }) {
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
        title="Online profile"
      >
        <IoIosGlobe className={iconClass} />
      </a>
    </div>
  );
}

function VoteDisplay({ candidate }: { candidate: CandidateWithVotes }) {
  const { t } = useTranslation();
  return <div className="text-lg">{t('vote_other', { count: candidate.votes })}</div>;
}

function CadidateCard({ candidate, maxVote }: { candidate: CandidateWithVotes; maxVote: number }) {
  const { t } = useTranslation();
  const name = `${candidate.given_name} ${candidate.surname}`;
  return (
    <div
      key={candidate.id}
      className="flex flex-col gap-4 dark:text-[#fafffe] bg-[#F3E5FF] dark:bg-[#bb66ff45] p-6 rounded-2xl"
    >
      <div className="flex flex-row items-center text-2xl gap-6">
        <CandidatePhoto candidate={candidate} />
        <div className="flex flex-col gap-2">
          <p className="mt-[-6px]">{name} </p>
          <div className="flex flex-row">
            <ExpertMatcherProfile candidate={candidate} />
            <OnlineProfile candidate={candidate} />
            <div className="border-l border-gray-400 pl-4 ml-2 flex flex-row gap-2 items-center">
              {candidate.votes > 0 && candidate.votes === maxVote && (
                <GoTrophy className={iconClass} title={t('Best match')} />
              )}
              <VoteDisplay candidate={candidate} />
            </div>
          </div>
        </div>
      </div>
      <CandidateCv candidate={candidate} />
    </div>
  );
}

export default function DifferentiationCandidates() {
  const { t } = useTranslation();
  const { candidates } = useCurrentMessage();
  const maxVote = Math.max(...candidates.map((c) => c.votes));
  if (candidates.length === 0) {
    return null;
  }
  return (
    <div className="text-[#07000d] dark:text-[#fafffe] w-full">
      <p className=" text-3xl py-6">{t('Candidates')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full">
        {candidates
          .sort((a, b) => b.votes - a.votes)
          .map((candidate) => (
            <CadidateCard key={candidate.id} candidate={candidate} maxVote={maxVote} />
          ))}
      </div>
    </div>
  );
}
