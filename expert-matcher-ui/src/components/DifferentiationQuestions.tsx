import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../hooks/useCurrentMessage';
import { QuestionWithSelectedOptions } from '../types/differentiation_questions';
import { buttonStyle } from './common';
import { useAppStore } from '../context/AppStore';

function Options({ question }: { question: QuestionWithSelectedOptions }) {

  const { selectDifferentiationQuestionOption, differentiationQuestions } = useAppStore();
  const selectedOptions = differentiationQuestions.find(q => q.question === question.question)?.selectedOptions;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-full my-2">
      {question.options.map((option, index) => (
        <button key={`${option.option}_${index}`} className={`${buttonStyle} ${selectedOptions?.map(o => o.option).includes(option.option) ? 'bg-teal-900' : ''}`} 
          onClick={() => selectDifferentiationQuestionOption(question.question, option.option)}>
          {option.option}
        </button>
      ))}
    </div>
  );
}

export default function DifferentiationQuestions() {
  const { t } = useTranslation();
  const { hasDifferentiationQuestions, differentiationQuestions } = useCurrentMessage();
  if (!hasDifferentiationQuestions) return null;
  return (
    <>
      <div className="dark:text-gray-100 my-5">
        <p className="w-full text-xl">{t('differentiationQuestionsIntro')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-full">
        {differentiationQuestions.map((question, index) => (
          <div key={`${question.id}-${index}`} className="dark:text-gray-100 ">
            <p className="w-full text-sm mb-1">{question.dimension}</p>
            <p className="w-full text-xl">{question.question}</p>
            <Options question={question} />
          </div>
        ))}
      </div>
    </>
  );
}
