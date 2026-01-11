import { useRef } from "hono/jsx";
import { render } from "hono/jsx/dom";

// クリップボードアイコンSVGコンポーネント
const ClipboardIcon = () => (
    <svg //
        viewBox="0 0 24 24"
        class="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
    >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect //
            x="8"
            y="2"
            width="8"
            height="4"
            rx="1"
            ry="1"
        />
    </svg>
);

// ツールチップコンポーネント
const Tooltip = () => (
    <div class="absolute right-[1px] bottom-full mb-1 whitespace-nowrap rounded-sm bg-gray-600 px-2 py-1 font-semibold text-gray-200 text-xs dark:bg-gray-200 dark:text-gray-800">Copied!</div>
);

type ShowTooltipArgs = {
    tooltipContainer: HTMLElement;
};

// ツールチップを表示する関数
const showTooltip = ({ tooltipContainer }: ShowTooltipArgs) => {
    render(<Tooltip />, tooltipContainer);

    // 1秒後にツールチップを削除
    setTimeout(() => {
        const tooltip = tooltipContainer.querySelector(".absolute");
        if (tooltip) tooltip.remove();
    }, 1000);
};

type HandleCopyArgs = {
    codeText: string;
    tooltipContainer: HTMLElement;
};

// コピー処理を行う関数
const handleCopy = async ({ codeText, tooltipContainer }: HandleCopyArgs) => {
    try {
        await navigator.clipboard.writeText(codeText);
        showTooltip({ tooltipContainer });
    } catch (error) {
        console.error("クリップボードへのコピーに失敗しました", error);
    }
};

type CopyButtonProps = {
    codeText: string;
};

/**
 * markdownのコードブロック右上に表示するコピーボタンコンポーネント
 */
export const CodeCopyButton = ({ codeText }: CopyButtonProps) => {
    const tooltipContainerRef = useRef<HTMLDivElement>(null);
    return (
        <div class="copy-button-container absolute top-1 right-2 rounded-lg p-1">
            <button
                type="button"
                class="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="クリップボードにコピー"
                // biome-ignore lint/style/noNonNullAssertion: <FIXME: 何故か非nullに推論されない おそらくhono側の問題>
                onClick={() => handleCopy({ codeText, tooltipContainer: tooltipContainerRef.current! })}
            >
                <ClipboardIcon />
            </button>
            <div //
                ref={tooltipContainerRef}
                class="relative flex items-center justify-center"
            ></div>
        </div>
    );
};
