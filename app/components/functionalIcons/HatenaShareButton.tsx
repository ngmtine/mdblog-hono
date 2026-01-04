import { BASE_URL } from "../../lib/constants";

type Props = {
    slug: string;
};

const HatenaIcon = () => (
    <svg
        viewBox="0 0 32 32" //
        class="h-8 w-8 transition group-hover:scale-120"
        aria-hidden="true"
    >
        <rect x="1" y="1" width="30" height="30" rx="4" ry="4" fill="none" stroke="currentColor" stroke-width="2" />
        <text x="16" y="23" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">
            B!
        </text>
    </svg>
);

export const HatenaShareButton = ({ slug }: Props) => {
    const pageUrl = `${BASE_URL}/posts/${encodeURIComponent(slug)}`;
    const shareUrl = `https://b.hatena.ne.jp/entry/${pageUrl}`;

    return (
        <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="はてなブックマークに追加"
            class="group inline-flex items-center text-gray-600 hover:text-[#00A4DE] dark:text-gray-400 dark:hover:text-[#00A4DE]"
        >
            <HatenaIcon />
        </a>
    );
};
