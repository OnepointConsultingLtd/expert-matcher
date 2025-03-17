import { useAppStore } from "../../context/AppStore";


export default function ErrorMessage() {
    const { errorMessage, setErrorMessage } = useAppStore();
    if(!errorMessage) return null;
    return (
        <div className="flex flex-row justify-between items-center w-full dark:bg-red-900 dark:border-red-900 dark:border-2
                 dark:border-solid dark:rounded-md px-2 mb-4 mt-4">
            <p className="text-red-500 dark:text-red-100">{errorMessage}</p>
            <button className="text-red-500 dark:text-red-100 dark:bg-red-900 dark:border-red-900 dark:border-2
                 dark:border-solid dark:rounded-md dark:p-2" onClick={() => setErrorMessage("")}>X</button>
        </div>
    )
}
