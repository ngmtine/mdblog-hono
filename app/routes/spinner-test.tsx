import { LoadingSpinner } from "../components/ui/loadingSpinner";

/**
 * ローディングスピナーの動作確認用ルート
 */
export default () => {
    return (
        <div class="flex flex-col items-center justify-center gap-12 p-8">
            <div class="text-center">
                <h1 class="mb-4 font-bold text-2xl text-gray-900 dark:text-white">Loading Spinner Test</h1>
                <p class="text-gray-600 dark:text-gray-400">ローディングスピナーの動作確認</p>
            </div>
            <LoadingSpinner />
        </div>
    );
};
