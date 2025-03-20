import { useAppStore } from '../../context/AppStore';

function renderMessage(
  message: string,
  bgColor: string,
  borderColor: string,
  setMessage: (message: string) => void
) {
  if (!message) return null;
  return (
    <div
      className={`flex flex-row justify-between items-center w-full ${bgColor} ${borderColor} dark:border-2
                 dark:border-solid dark:rounded-md px-2 mb-4 mt-4`}
    >
      <p className="text-red-500 dark:text-red-100">{message}</p>
      <button
        className={`text-red-500 dark:text-red-100 ${bgColor} ${borderColor} dark:border-2
                 dark:border-solid dark:rounded-md dark:p-2`}
        onClick={() => setMessage('')}
      >
        X
      </button>
    </div>
  );
}

export default function ErrorMessage() {
  const { errorMessage, setErrorMessage, successMessage, setSuccessMessage } = useAppStore();
  if (!errorMessage && !successMessage) return null;
  return (
    <>
      {renderMessage(errorMessage, 'dark:bg-red-900', 'dark:border-red-900', setErrorMessage)}
      {renderMessage(
        successMessage,
        'dark:bg-green-900',
        'dark:border-green-900',
        setSuccessMessage
      )}
    </>
  );
}
