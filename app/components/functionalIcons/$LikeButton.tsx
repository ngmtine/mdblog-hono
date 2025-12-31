import { useEffect, useState } from "hono/jsx";

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

export const LikeButton = ({ postId }: Props) => {
    const [likeCount, setLikeCount] = useState<number | undefined>(undefined);

    // 初期いいね数取得
    useEffect(() => {
        const getLikeCount = async () => {
            try {
                const response = await fetch(`/api/likes?postId=${postId}`);
                if (!response.ok) throw new Error("response error");
                const data = (await response.json()) as { likeCount: number };
                setLikeCount(data.likeCount);
            } catch (error) {
                console.error("Error getting likeCount:", error);
            }
        };
        getLikeCount();
    }, [postId]);

    // いいねボタン押下イベント
    const handleLike = async () => {
        const previousLikeCount = likeCount ?? 0;
        try {
            setLikeCount(Number(previousLikeCount) + 1); // 楽観的更新

            const response = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId }),
            });
            if (!response.ok) throw new Error("response error");
            const data = (await response.json()) as { likeCount: number };
            setLikeCount(data.likeCount);
        } catch (error) {
            console.error("Error submitting like:", error);
            setLikeCount(previousLikeCount); // ロールバック
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
            <span class="absolute top-[8px] font-bold text-md">{likeCount}</span>
        </button>
    );
};
