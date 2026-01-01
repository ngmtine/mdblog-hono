import { useEffect } from "hono/jsx";

type Props = {
    postId: number;
};

const HeartIcon = () => (
    <svg
        viewBox="0 -1 24 24"
        class="h-9 w-9 transition group-hover:scale-110 group-active:scale-95" //
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

// DOM要素のIDを生成
const getLikeCountElementId = (postId: number) => `like-count-${postId}`;

// DOM要素のテキストを更新
const updateLikeCountDisplay = (postId: number, count: number) => {
    const element = document.getElementById(getLikeCountElementId(postId));
    if (element) {
        element.textContent = String(count);
    }
};

export const LikeButton = ({ postId }: Props) => {
    // 初期いいね数取得
    useEffect(() => {
        const getLikeCount = async () => {
            try {
                // タイムスタンプでキャッシュバスト
                const timestamp = Date.now();
                const response = await fetch(`/api/likes?postId=${postId}&_t=${timestamp}`, {
                    cache: "no-store",
                    headers: { "Cache-Control": "no-cache" },
                });
                if (!response.ok) throw new Error("response error");
                const data = (await response.json()) as { likeCount: number };
                updateLikeCountDisplay(postId, data.likeCount);
            } catch (error) {
                console.error("Error getting likeCount:", error);
            }
        };
        getLikeCount();
    }, [postId]);

    // いいねボタン押下イベント
    const handleLike = async () => {
        const element = document.getElementById(getLikeCountElementId(postId));
        const previousLikeCount = Number(element?.textContent) || 0;

        try {
            // 楽観的更新（DOM直接操作）- この値を信頼する
            updateLikeCountDisplay(postId, previousLikeCount + 1);

            const response = await fetch("/api/likes", {
                method: "POST",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                },
                body: JSON.stringify({ postId }),
            });

            // POSTが成功すればOK（レスポンスのlikeCountは使わない）
            // Hyperdriveの読み取り整合性問題により古い値が返る可能性があるため
            if (!response.ok) throw new Error("response error");
        } catch (error) {
            console.error("Error submitting like:", error);
            updateLikeCountDisplay(postId, previousLikeCount); // エラー時のみロールバック
        }
    };

    return (
        <button
            type="button"
            onClick={handleLike}
            aria-label="いいね！"
            class="group relative inline-flex cursor-pointer items-center justify-center text-gray-600 transition hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
        >
            <HeartIcon />
            <span id={getLikeCountElementId(postId)} class="absolute top-[8px] font-bold text-md" />
        </button>
    );
};
