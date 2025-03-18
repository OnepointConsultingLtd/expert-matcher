import { useCurrentMessage } from '../hooks/useCurrentMessage';

export default function Question() {
  const currentMessage = useCurrentMessage();
  if (!currentMessage.questionSuggestions || currentMessage.hasDifferentiationQuestions)
    return null;

  const { questionSuggestions } = currentMessage;
  return (
    <div className="dark:text-gray-100 w-full text-2xl">
      <p>{questionSuggestions.question}</p>
    </div>
  );
}
