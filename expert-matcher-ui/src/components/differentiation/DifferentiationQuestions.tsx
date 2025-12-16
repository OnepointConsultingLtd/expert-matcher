import { useTranslation } from 'react-i18next';
import { useCurrentMessage } from '../../hooks/useCurrentMessage';
import { QuestionWithSelectedOptions } from '../../types/differentiation_questions';
import { buttonStyle } from '../common';
import { useAppStore } from '../../context/AppStore';
import { useChatStore } from '../../context/ChatStore';
import { formatDimensionName } from '../../lib/formatters';

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
    if (isSelected) {
      removeDifferentiationQuestionOption(question.question, option, socket);
    } else {
      selectDifferentiationQuestionOption(question.question, option, socket);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-full my-2">
      {question.options.map((option, index) => {
        const isSelected = selectedOptions?.map((o) => o.option).includes(option.option) ?? false;
        return (
          <button
            key={`${option.option}_${index}`}
            className={`p-2 ${buttonStyle} ${isSelected ? 'bg-[#9A19FF] text-[#fafffe]' : 'border border-[#514C55]'}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full my-6">
        {differentiationQuestions.map((question, index) => (
          <div
            key={`${question.question}-${index}`}
            className="bg-[#E6E5E6] dark:text-[#fafffe] dark:bg-[#38333d] p-6 rounded-2xl flex flex-col gap-3"
          >
            <p className="w-fit mb-1 border border-[#6A666D] rounded-2xl py-1 px-2 bg-[#6A666D15] dark:bg-[#6A666D45] text-xs text-[#6A666D] dark:text-[#CDCCCE]">
              {formatDimensionName(question.dimension)}
            </p>
            <p className="w-full text-xl">{question.question}</p>
            <Options question={question} />
          </div>
        ))}
      </div>
    </>
  );
}
