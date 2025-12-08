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

  const isAllSelected   =    selectedSuggestions && selectedSuggestions.length > 0;

  const handleToggle = () => {
    if (isAllSelected) {
      deselectAllSuggestions();
    } else {
      selectAllSuggestions();
    }
  };

  return (
    <div>
      <button className={buttonStyle} onClick={handleToggle} disabled={sending || !isLast}>
        {t(isAllSelected ? 'Deselect all' : 'Select all')}
      </button>
    </div>
  );
}

export default function NavigationButtons() {
  const { t } = useTranslation();
  const { sending, previousQuestion, currentIndex } = useAppStore();
  const { handleNext } = useHandleNext();
  const { selectedSuggestions, historyLength, hasDifferentiationQuestions } = useCurrentMessage();
  return (
    <div
      className={`flex ${!hasDifferentiationQuestions ? 'justify-between' : 'justify-end'} mt-6 mb-3`}
    >
      {!hasDifferentiationQuestions && <SelectButtons />}
      <div className="flex flex-col">
        <div className="flex flex-row">
          <button
            className={`${buttonStyle} ml-2 flex`}
            onClick={() => previousQuestion()}
            disabled={sending || currentIndex === 0}
            title="Previous"
          >
            <MdOutlineArrowBackIos className="md:mr-2 h-6 w-6" />
            {/* <span className="hidden md:inline">{t('Previous')}</span> */}
          </button>
          {historyLength > 0 && (
            <div className="text-[#07000d] dark:text-[#fafffe]">
              {t('stepOf', { step: currentIndex + 1, total: historyLength })}
            </div>
          )}
          <button
            className={`${buttonStyle} ml-2 flex`}
            onClick={() => handleNext()}
            disabled={sending || selectedSuggestions.length === 0}
            title="Next"
          >
            <MdOutlineArrowForwardIos className="md:mr-2 h-6 w-6" />
            {/* <span className="hidden md:inline">{t('Next')}</span> */}
          </button>
        </div>
      </div>
    </div>
  );
}
