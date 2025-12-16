import { useWebsockets } from '../hooks/useWebsockets';
import { useAppStore } from '../context/AppStore';
import ErrorMessage from './messages/ErrorMessage';
import DifferentiationPanel from './differentiation/DifferentiationPanel';
import QuestionsPanel from './questions/QuestionsPanel';
import ThinkingMsgSpinner from './spinners/ThinkingMsgSpinner';

export default function Body() {
  useWebsockets();
  const { connected, sending } = useAppStore();

  return (
    <div className="body min-h-14 pt-2 md:pt-3 pb-6 flex items-center w-full">
      <div className="body-container flex flex-row w-full">
        <div className="interaction-container flex flex-col w-full">
          <div className="flex flex-row justify-center items-center w-full">
            {!connected && <ThinkingMsgSpinner />}
            {sending && <ThinkingMsgSpinner />}
          </div>
          <ErrorMessage />
          <QuestionsPanel />
          <DifferentiationPanel />
        </div>
        <div className="progress-container flex flex-col"></div>
      </div>
    </div>
  );
}
