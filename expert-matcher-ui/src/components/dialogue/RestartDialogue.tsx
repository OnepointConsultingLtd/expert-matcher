import { useTranslation } from 'react-i18next';
import { useRestart } from '../../hooks/useRestart';
import onCloseDialogue from '../../lib/dialogueFunctions';
import DialogueHeader from './DialogueHeader';
import DialogueBody from './DialogueBody';
import ButtonPanel from './ButtonPanel';

export const RESTART_DIALOGUE_ID = 'restart-dialogue';

function onClose() {
  onCloseDialogue(RESTART_DIALOGUE_ID);
}

export default function RestartDialogue() {
  const { onRestart } = useRestart();
  const { t } = useTranslation();

  return (
    <dialog
      data-model={true}
      id={RESTART_DIALOGUE_ID}
      className="companion-dialogue w-11/12 md:w-1/2 bg-[#fafffe] shadow-lg max-w-3xl outline-0 rounded-lg dark:bg-[#1F1925] dark:text-[#fafffe]"
    >
      <DialogueHeader onClose={onClose}>
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M54 27C54 6.75 47.25 0 27 0C6.75 0 0 6.75 0 27C0 47.25 6.75 54 27 54C47.25 54 54 47.25 54 27Z" fill="#9A19FF"/>
          <path d="M25.5773 26.4783V18.2412C25.5773 17.3322 26.3157 16.5938 27.2247 16.5938C28.1337 16.5938 28.8721 17.3322 28.8721 18.2412V26.4783C28.8721 27.3873 28.1337 28.1257 27.2247 28.1257C26.3157 28.1257 25.5773 27.3873 25.5773 26.4783ZM33.7549 19.0093C33.2212 18.5868 32.4426 18.6795 32.02 19.2141C31.5974 19.7495 31.6893 20.5264 32.2247 20.9498C34.1845 22.4958 35.3078 24.8107 35.3078 27.3024C35.3078 31.7591 31.6814 35.3856 27.2256 35.3856C22.7689 35.3856 19.1425 31.7591 19.1425 27.3024C19.1425 24.8116 20.265 22.4975 22.223 20.9525C22.7584 20.5299 22.8503 19.753 22.4277 19.2167C22.0051 18.6812 21.2291 18.5903 20.6919 19.012C18.1363 21.0286 16.6709 24.0505 16.6709 27.3024C16.6709 33.1222 21.4058 37.8563 27.2247 37.8563C33.0436 37.8563 37.7785 33.1213 37.7785 27.3024C37.7785 24.0487 36.3113 21.0268 33.7549 19.0093Z" fill="#fafffe"/>
        </svg>
      </DialogueHeader>
      <DialogueBody>{t('Would you like to restart the expert matcher?')}</DialogueBody>
      <ButtonPanel
        onOk={() => {
          onRestart();
          onClose();
        }}
        okText={t('Restart')}
        disabled={false}
      />
    </dialog>
  );
}
