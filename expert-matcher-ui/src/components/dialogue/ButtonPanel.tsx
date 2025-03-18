export default function ButtonPanel({
  onOk,
  okText,
  disabled = false,
}: {
  onOk: () => void;
  okText: string;
  disabled: boolean;
}) {
  return (
    <div className="companion-dialogue-buttons flex flex-row justify-end gap-4 px-6 pt-4 pb-8">
      <button
        data-close-modal={true}
        onClick={onOk}
        className="button-ok border border-solid border-[#0084d7] hover:border-[#055D94] py-2.5 text-base font-medium text-[#0084d7] hover:text-[#055D94] focus:ring-4 focus:outline-none focus:ring-blue-300
            text-center uppercase w-20 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-100 dark:border-white dark:hover:text-gray-50"
        disabled={disabled}
      >
        {okText}
      </button>
    </div>
  );
}
