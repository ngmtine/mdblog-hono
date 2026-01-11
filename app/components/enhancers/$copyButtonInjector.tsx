import { useEffect } from "hono/jsx";
import { render } from "hono/jsx/dom";

import { CodeCopyButton } from "../functionalIcons/$codeCopyButton";

/**
 * コードブロックにコピーボタンを追加する副作用を提供するコンポーネント
 */
export const CopyButtonInjector = (): null => {
    useEffect(() => {
        const codeBlocks = Array.from(document.querySelectorAll("pre:has(code)"));

        for (const pre of codeBlocks) {
            // すでにボタンが追加されている場合はスキップ
            if (pre.classList.contains("has-copy-button")) continue;

            const code = pre.querySelector("code");
            if (!code) continue;

            const codeText = code.textContent || "";

            // preをラップするdivを作成
            const wrapper = document.createElement("div");
            wrapper.classList.add("relative");

            // ボタンコンテナを作成
            const buttonContainer = document.createElement("div");

            // CopyButtonをレンダリング
            render(<CodeCopyButton codeText={codeText} />, buttonContainer);

            // wrapperにボタンを追加
            wrapper.appendChild(buttonContainer);

            // preをwrapperに移動
            pre.parentElement?.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            // preにマークを追加
            pre.classList.add("has-copy-button");

            // preのrelativeを削除（もしあれば）
            pre.classList.remove("relative");
        }
    }, []);

    return null; // このコンポーネントはDOMを変更する副作用を提供するだけなので、jsxとしては何も返さない
};
