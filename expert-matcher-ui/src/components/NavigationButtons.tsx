import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/AppStore';
import { buttonStyle } from './common';
import { useHandleNext } from '../hooks/useHandleNext';
import { MdOutlineArrowForwardIos, MdOutlineArrowBackIos } from 'react-icons/md';
import { useCurrentMessage } from '../hooks/useCurrentMessage';

// function SelectButtons() {
//   const { t } = useTranslation();
//   const {
//     selectAllSuggestions,
//     deselectAllSuggestions,
//     sending,
//   } = useAppStore();
//   const { isLast } = useCurrentMessage();
//   return (
//     <div>
//       <button
//         className={buttonStyle}
//         onClick={() => deselectAllSuggestions()}
//         disabled={sending || !isLast}
//       >
//         {t('Deselect all')}
//       </button>
//       <button
//         className={`${buttonStyle} ml-2`}
//         onClick={() => selectAllSuggestions()}
//         disabled={sending || !isLast}
//       >
//         {t('Select all')}
//       </button>
//     </div>
//   )
// }

function SelectButtons() {
  const { t } = useTranslation();
  const { selectAllSuggestions, deselectAllSuggestions, sending } = useAppStore();
  const { isLast, selectedSuggestions } = useCurrentMessage();

  const isAllSelected = selectedSuggestions && selectedSuggestions.length > 0;

  const handleToggle = () => {
    if (isAllSelected) {
      deselectAllSuggestions();
    } else {
      selectAllSuggestions();
    }
  };

  return (
    <div>
      {!sending && <button className={buttonStyle} onClick={handleToggle} disabled={sending || !isLast}>
        {t(isAllSelected ? 'Deselect all' : 'Select all')}
      </button>}
    </div>
  );
}

export default function NavigationButtons() {
  const { t } = useTranslation();
  const { sending, previousQuestion, currentIndex } = useAppStore();
  const { handleNext } = useHandleNext();
  const { selectedSuggestions, historyLength, hasDifferentiationQuestions } = useCurrentMessage();
  console.log(selectedSuggestions, currentIndex);

  const hasAnySuggestionsSelected = selectedSuggestions.length > 0;
  console.log('hasAnySuggestions ', hasAnySuggestionsSelected);

  if(sending) return null;

  return (
    <div
      className={`flex ${!hasDifferentiationQuestions ? 'justify-between' : 'justify-end'} mt-6 mb-3`}
    >
      {!hasDifferentiationQuestions && <SelectButtons />}
      <div className="flex flex-col">
        <div className="flex items-center justify-center gap-4 mt-6 mb-3 w-full">
          {currentIndex > 0 ? (
            <button
              onClick={() => previousQuestion()}
              disabled={sending}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10
 transition disabled:opacity-40 cursor-pointer"
              title="Previous"
            >
              <MdOutlineArrowBackIos className="h-6 w-6 text-gray-600 dark:text-gray-300 " />
            </button>
          ) : (
            <div className="w-10"></div>
          )}

          <div className="text-gray-900 dark:text-[#fafffe] text-lg font-medium min-w-[110px] text-center">
            {t('stepOf', { step: currentIndex + 1, total: historyLength })}
          </div>

          <button
            onClick={() => handleNext()}
            disabled={sending || selectedSuggestions.length === 0}
            title="Next"
            className={`
      p-2 rounded-full transition transform 
      flex items-center justify-center
      ${
        selectedSuggestions.length > 0
          ? 'bg-[#9A19FF] text-white hover:scale-105 cursor-pointer'
          : 'bg-white/5 text-gray-400 opacity-40'
      }
    `}
          >
            <MdOutlineArrowForwardIos className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
