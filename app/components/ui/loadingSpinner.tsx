/**
 * 画像読込時のローディングスピナーコンポーネント
 */
export const LoadingSpinner = () => {
    return (
        // biome-ignore lint/a11y/useSemanticElements: Loading spinner with role="status" is semantically appropriate for accessibility
        <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent border-solid align-[-0.125em] text-gray-900 motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
        >
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
    );
};
