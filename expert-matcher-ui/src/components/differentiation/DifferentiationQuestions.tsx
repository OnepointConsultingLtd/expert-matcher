import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import { QuestionWithSelectedOptions } from '../../types/differentiation_questions';
import { buttonStyle } from '../common';
import { useAppStore } from '../../context/AppStore';
import { useChatStore } from '../../context/ChatStore';


function Options({ question }: { question: QuestionWithSelectedOptions }) {
  const { t } = useTranslation();
  const { socket } = useChatStore();

  const {
    selectDifferentiationQuestionOption,
    removeDifferentiationQuestionOption,
    differentiationQuestions,
  } = useAppStore();
  const selectedOptions = differentiationQuestions.find(
    (q) => q.question === question.question
  )?.selectedOptions;

  function onSelectOption(option: string, isSelected: boolean) {
    if(isSelected) {
      removeDifferentiationQuestionOption(question.question, option, socket)
    } else {
      selectDifferentiationQuestionOption(question.question, option, socket)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-full my-2">
      {question.options.map((option, index) => {
        const isSelected = selectedOptions?.map((o) => o.option).includes(option.option) ?? false;
        return (
          <button
            key={`${option.option}_${index}`}
            className={`${buttonStyle} ${isSelected ? 'bg-teal-900' : ''}`}
            title={isSelected ? t('titleRemoveOption') : t('titleAddOption')}
            onClick={() => onSelectOption(option.option, isSelected)}
          >
            {option.option}
          </button>
        );
      })}
    </div>
  );
}

export default function DifferentiationQuestions() {
  const { differentiationQuestions } = useCurrentMessage();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-full">
        {differentiationQuestions.map((question, index) => (
          <div key={`${question.question}-${index}`} className="dark:text-gray-100 ">
            <p className="w-full text-sm mb-1">{question.dimension}</p>
            <p className="w-full text-xl">{question.question}</p>
            <Options question={question} />
          </div>
        ))}
      </div>
    </>
  );
}
