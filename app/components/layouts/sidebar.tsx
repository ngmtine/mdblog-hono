import { ToggleDarkmodeButton } from "../functionalIcons/$toggleDarkmodeButton";
import { GithubLinkButton } from "../functionalIcons/githubLinkButton";
import { TwitterLinkButton } from "../functionalIcons/twitterLinkButton";
import { Card } from "../ui/card";
import type { Post } from "../../lib/posts";

type Props = {
    posts: Post[];
    genreList: string[];
};

export const Sidebar = ({ posts, genreList }: Props) => (
    <Card
        variant="surface" //
        class="p-2"
    >
        {/* ジャンル一覧 */}
        <div class="p-2 pt-0 font-semibold text-xl">Genre</div>
        <Card
            as="nav" //
            variant="inner"
            class="p-4 py-2 leading-relaxed"
        >
            <ul>
                {genreList.map((genre) => (
                    <li key={genre}>
                        <a
                            href={`/genre/${genre.toLowerCase()}`} //
                            class="block hover:text-blue-400"
                        >
                            {genre}
                        </a>
                    </li>
                ))}
            </ul>
        </Card>

        {/* 新着記事一覧 */}
        <div class="p-2 font-semibold text-xl">Recent</div>
        <Card
            as="nav" //
            variant="inner"
            class="p-4 py-2 leading-relaxed"
        >
            <ul>
                {posts.map((post) => (
                    <li key={post.slug}>
                        <a
                            href={`/posts/${post.slug}`} //
                            class="block hover:text-blue-400"
                        >
                            {post.frontmatter.title ?? post.slug}
                        </a>
                    </li>
                ))}
            </ul>
        </Card>

        {/* 下部ボタン類 */}
        <div
            id="sidebarButtonArea" //
            class="fixed bottom-0 mb-[0.2rem] ml-auto"
        >
            <ToggleDarkmodeButton />
            <GithubLinkButton />
            <TwitterLinkButton />
        </div>
    </Card>
);
