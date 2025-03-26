import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { useAppStore } from '../context/AppStore';
function TitleDisplay({message}: {message: string}) {
  return (
    <div className="dark:text-gray-100 w-full text-2xl">
      <p>{message}</p>
    </div>
  );
}

export default function Question() {
  const { t } = useTranslation();
  const { sending } = useAppStore();
  const { questionSuggestions, displayRegularQuestions } = useCurrentMessage();
  if(sending) return null;
  if (!questionSuggestions || !displayRegularQuestions || sending)
    return (
      <TitleDisplay message={t('differentiationQuestionsIntro')} />
    );

  return (
    <TitleDisplay message={questionSuggestions.question} />
  );
}
