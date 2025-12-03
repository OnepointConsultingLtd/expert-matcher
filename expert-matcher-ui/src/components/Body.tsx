import { useWebsockets } from '../hooks/useWebsockets';
import { useAppStore } from '../context/AppStore';
import Spinner from './spinners/Spinner';
import ErrorMessage from './messages/ErrorMessage';
import DifferentiationPanel from './differentiation/DifferentiationPanel';
import QuestionsPanel from './questions/QuestionsPanel';

export default function Body() {
  useWebsockets();
  const { connected, sending } = useAppStore();

  return (
    <div className="body min-h-14 pt-2 md:pt-3 pb-6 flex items-center w-full">
      <div className="body-container flex flex-row w-full">
        <div className="interaction-container flex flex-col w-full">
          <div className="flex flex-row justify-center items-center w-full">
            {!connected && <Spinner message="Connecting to server" />}
            {sending && <Spinner />}
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
