import { useState } from "hono/jsx";

import { LoadingSpinner } from "../ui/loadingSpinner";

type LoadingImageProps = {
    src: string;
    alt?: string;
    className?: string;
};

/**
 * 画像をプログレッシブに表示し、読み込み完了までスピナーをオーバーレイするコンポーネント
 */
export const LoadingImage = ({ src, alt = "", className = "" }: LoadingImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative inline-block ${className}`}>
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={`transition-all duration-300 ${loaded ? "opacity-100 filter-none" : "opacity-70 blur-sm filter"}`}
            />
            {!loaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 dark:bg-gray-800">
                    <LoadingSpinner />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-75 text-red-600 text-sm dark:bg-red-900 dark:text-red-400">画像の読み込みに失敗しました</div>
            )}
        </div>
    );
};
