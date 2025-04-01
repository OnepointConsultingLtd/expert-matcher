import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import DifferentiationCandidates from './DifferentiationCandidates';
import DifferentiationQuestions from './DifferentiationQuestions';
import SaveVotes from './SaveVotes';
import { useAppStore } from '../../context/AppStore';

export default function DifferentiationPanel() {
  const { sending } = useAppStore();
  const { displayRegularQuestions } = useCurrentMessage();
  if (displayRegularQuestions || sending) return null;
  return (
    <>
      <SaveVotes />
      <DifferentiationQuestions />
      <DifferentiationCandidates />
    </>
  );
}
