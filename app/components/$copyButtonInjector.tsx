import { useEffect } from "hono/jsx";
import { render } from "hono/jsx/dom";

import { CodeCopyButton } from "./functionalIcons/$codeCopyButton";

/**
 * コードブロックにコピーボタンを追加する副作用を提供するコンポーネント
 */
export const CopyButtonInjector = (): null => {
    useEffect(() => {
        const codeBlocks = Array.from(document.querySelectorAll("pre:has(code)"));

        for (const pre of codeBlocks) {
            // すでにボタンが追加されている場合はスキップ
            if (pre.querySelector(".copy-button-container")) continue;

            const code = pre.querySelector("code");
            if (!code) continue;

            const codeText = code.textContent || "";

            // preにrelativeクラスを追加
            pre.classList.add("relative");

            // ボタンコンテナを作成
            const buttonContainer = document.createElement("div");

            // CopyButtonをレンダリング
            render(<CodeCopyButton codeText={codeText} />, buttonContainer);

            // preに追加
            pre.appendChild(buttonContainer);
        }
    }, []);

    return null; // このコンポーネントはDOMを変更する副作用を提供するだけなので、jsxとしては何も返さない
};
