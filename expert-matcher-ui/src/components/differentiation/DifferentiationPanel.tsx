import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import DifferentiationCandidates from './DifferentiationCandidates';
import DifferentiationQuestions from './DifferentiationQuestions';
import SaveVotes from './SaveVotes';

export default function DifferentiationPanel() {
  const { displayRegularQuestions } = useCurrentMessage();
  if (displayRegularQuestions) return null;
  return (
    <>
      <SaveVotes />
      <DifferentiationQuestions />
      <DifferentiationCandidates />
    </>
  );
}
