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

        {/* モバイル用サイドバー（ドロワー形式） */}
        <aside
            id="mobile-sidebar"
            class="fixed top-0 left-0 z-50 h-full w-[85vw] max-w-85 -translate-x-full overflow-y-auto bg-white pt-16 transition-transform duration-300 md:hidden dark:bg-gray-900"
        >
            <div class="p-4">
                <Sidebar
                    posts={posts} //
                    genreList={genreList}
                />
            </div>
        </aside>

        {/* デスクトップ用サイドバー */}
        <aside class="sticky top-0 hidden h-screen w-70 min-w-70 overflow-y-hidden pt-20 pl-4 md:block">
            <Sidebar
                posts={posts} //
                genreList={genreList}
            />
        </aside>
    </>
);
