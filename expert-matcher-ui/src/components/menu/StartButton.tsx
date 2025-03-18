import { useTranslation } from 'react-i18next';
import MenuItemTemplate from './MenuItemTemplate';
import { showDialogue } from '../../lib/dialogueFunctions';
import { RESTART_DIALOGUE_ID } from '../dialogue/RestartDialogue';
import { useHamburgerStore } from '../../context/HamburgerStore';

export default function StartButton() {
  const { t } = useTranslation();
  const { setOpen } = useHamburgerStore();

  return (
    <>
      <MenuItemTemplate
        title={t('Restart')}
        func={() => {
          setOpen(false);
          showDialogue(RESTART_DIALOGUE_ID);
        }}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pl-3 w-8 h-8"
        >
          <g clipPath="url(#clip0_801_992)">
            <path
              d="M8.87335 9.7625V1.62708C8.87335 0.729293 9.60264 0 10.5004 0C11.3982 0 12.1275 0.729293 12.1275 1.62708V9.7625C12.1275 10.6603 11.3982 11.3896 10.5004 11.3896C9.60264 11.3896 8.87335 10.6603 8.87335 9.7625ZM16.95 2.38575C16.4229 1.9684 15.6539 2.05999 15.2365 2.58795C14.8192 3.11678 14.9099 3.88409 15.4387 4.30231C17.3743 5.82916 18.4838 8.11554 18.4838 10.5765C18.4838 14.9782 14.9021 18.5598 10.5013 18.5598C6.09962 18.5598 2.51796 14.9782 2.51796 10.5765C2.51796 8.11641 3.62659 5.83088 5.56042 4.3049C6.08925 3.88754 6.17998 3.12023 5.76262 2.59054C5.34527 2.06172 4.57882 1.97186 4.04827 2.38835C1.52426 4.38008 0.0769043 7.36465 0.0769043 10.5765C0.0769043 16.3244 4.75336 21 10.5004 21C16.2475 21 20.924 16.3235 20.924 10.5765C20.924 7.36292 19.4749 4.37835 16.95 2.38575Z"
              fill="#4A4A4A"
              className="dark:!fill-gray-100"
            />
          </g>
          <defs>
            <clipPath id="clip0_801_992">
              <rect width="21" height="21" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </MenuItemTemplate>
    </>
  );
}
