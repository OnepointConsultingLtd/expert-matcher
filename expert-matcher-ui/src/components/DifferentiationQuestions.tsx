import { useCurrentMessage } from '../hooks/useCurrentMessage';

export default function DifferentiationQuestions() {
  const { hasDifferentiationQuestions, differentiationQuestions } = useCurrentMessage();
  if (!hasDifferentiationQuestions) return null;
  debugger
  return (
    <>
      {differentiationQuestions.map((question) => (
        <div className="dark:text-gray-100 w-full text-2xl">
          <p>{question.question}</p>
        </div>
      ))}
    </>
  );
}
