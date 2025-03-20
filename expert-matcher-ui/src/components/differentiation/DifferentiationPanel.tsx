import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import DifferentiationCandidates from './DifferentiationCandidates';
import DifferentiationQuestions from './DifferentiationQuestions';
import SaveVotes from './SaveVotes';

export default function DifferentiationPanel() {
  const { hasDifferentiationQuestions } = useCurrentMessage();
  if (!hasDifferentiationQuestions) return null;
  return (
    <>
      <DifferentiationQuestions />
      <SaveVotes />
      <DifferentiationCandidates />
    </>
  );
}
