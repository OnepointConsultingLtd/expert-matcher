import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { useAppStore } from '../context/AppStore';
function TitleDisplay({ message }: { message: string }) {
  return (
    <div className="text-[#07000d] dark:text-[#fafffe] w-full text-3xl py-6">
      <p>{message}</p>
    </div>
  );
}

export default function Question() {
  const { t } = useTranslation();
  const { sending } = useAppStore();
  const { questionSuggestions, displayRegularQuestions } = useCurrentMessage();
  if (sending) return null;
  if (!questionSuggestions || !displayRegularQuestions || sending)
    return <TitleDisplay message={t('differentiationQuestionsIntro')} />;

  return (
    <>
      <TitleDisplay message={questionSuggestions.question} />
      {displayRegularQuestions && !sending && (
        <div
          className="w-full mb-12 text-[#4d4d4d] dark:text-gray-100 gap-4"
          dangerouslySetInnerHTML={{
            __html: t('placeholder-normal'),
          }}
        />
      )}
    </>
  );
}
