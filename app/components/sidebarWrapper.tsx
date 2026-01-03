import { Sidebar } from "./sidebar";
import type { Post } from "../lib/posts";

type Props = {
    posts: Post[];
    genreList: string[];
};

export const SidebarWrapper = ({ posts, genreList }: Props) => (
    <>
        {/* モバイル用オーバーレイ */}
        <div
            id="mobile-sidebar-overlay" //
            class="fixed inset-0 z-40 hidden bg-black/50 backdrop-blur-sm md:hidden"
        />

        {/* サイドバー: モバイルはドロワー、デスクトップは常時表示 */}
        <aside
            id="mobile-sidebar"
            class="fixed top-0 left-0 z-50 h-full w-[85vw] max-w-85 -translate-x-full overflow-y-auto bg-white/80 p-4 pt-16 transition-transform duration-300 md:sticky md:z-auto md:h-screen md:w-70 md:min-w-70 md:max-w-none md:translate-x-0 md:overflow-y-hidden md:p-0 md:pt-20 md:pl-4 dark:bg-gray-900/80"
        >
            <Sidebar
                posts={posts} //
                genreList={genreList}
            />
        </aside>
    </>
);
