import { useEffect } from "hono/jsx";
import { render } from "hono/jsx/dom";

import { LoadingImage } from "./$loadingImage";

/**
 * imgタグをLoadingImageコンポーネントに置き換える副作用を提供するコンポーネント
 */
export const LoadingImageInjector = (): null => {
    useEffect(() => {
        const images = Array.from(document.querySelectorAll("article img"));

        for (const img of images) {
            // すでに置き換えられている場合はスキップ
            if (img.closest(".loading-image-container")) continue;

            const src = img.getAttribute("src") || "";
            const alt = img.getAttribute("alt") || "";
            const className = img.getAttribute("class") || "";

            // コンテナを作成
            const container = document.createElement("div");
            container.className = "loading-image-container inline-block";

            // LoadingImageをレンダリング
            render(<LoadingImage src={src} alt={alt} className={className} />, container);

            // imgを置き換え
            img.parentNode?.replaceChild(container, img);
        }
    }, []);

    return null; // このコンポーネントはDOMを変更する副作用を提供するだけなので、jsxとしては何も返さない
};
