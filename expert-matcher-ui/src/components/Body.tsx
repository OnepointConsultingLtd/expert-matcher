import { useWebsockets } from '../hooks/useWebsockets';
import { useAppStore } from '../context/AppStore';
import Spinner from './Spinner';
import Question from './Question';
import Suggestions from './Suggestions';
import NavigationButtons from './NavigationButtons';
import ErrorMessage from './messages/ErrorMessage';
import DifferentiationQuestions from './DifferentiationQuestions';

export default function Body() {
  useWebsockets();
  const { connected, sending } = useAppStore();

  return (
    <div className="body min-h-14 pt-2 md:pt-3 pb-2 flex items-center w-full">
      <div className="body-container flex flex-row w-full">
        <div className="interaction-container flex flex-col w-full">
          <div className="flex flex-row justify-center items-center w-full">
            {!connected && <Spinner />}
            {sending && <Spinner />}
          </div>
          <ErrorMessage />
          <DifferentiationQuestions />
          <Question />
          <NavigationButtons />
          <Suggestions />
        </div>
        <div className="progress-container flex flex-col"></div>
      </div>
    </div>
  );
}
