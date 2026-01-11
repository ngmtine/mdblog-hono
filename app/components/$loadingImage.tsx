import { useState } from "hono/jsx";

import { LoadingSpinner } from "./loadingSpinner";

type LoadingImageProps = {
    src: string;
    alt?: string;
    className?: string;
};

/**
 * 画像読み込み中にスピナーを表示し、読み込み完了後に画像を表示するコンポーネント
 */
export const LoadingImage = ({ src, alt = "", className = "" }: LoadingImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative inline-block ${className}`}>
            {!loaded && !error && <LoadingSpinner />}
            {error ? (
                <div className="text-red-500 text-sm">画像の読み込みに失敗しました</div>
            ) : (
                <img //
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`${loaded ? "block" : "hidden"}`}
                />
            )}
        </div>
    );
};
