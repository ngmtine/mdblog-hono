import { LoadingSpinner } from "../components/ui/loadingSpinner";

/**
 * ローディングスピナーの動作確認用ルート
 */
export default () => {
    return (
        <div className="flex flex-col items-center justify-center gap-12 p-8">
            <div className="text-center">
                <h1 className="mb-4 font-bold text-2xl text-gray-900 dark:text-white">Loading Spinner Test</h1>
                <p className="text-gray-600 dark:text-gray-400">ローディングスピナーの動作確認</p>
            </div>
            <LoadingSpinner />
        </div>
    );
};
