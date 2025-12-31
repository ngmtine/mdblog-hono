import { ToggleDarkmodeButton } from "./functionalIcons/$toggleDarkmodeButton";
import { GithubLinkButton } from "./functionalIcons/githubLinkButton";
import { TwitterLinkButton } from "./functionalIcons/twitterLinkButton";
import type { Post } from "../lib/posts";

type Props = {
    posts: Post[];
    genreList: string[];
};

export const Sidebar = (props: Props) => {
    const { posts, genreList } = props;
    return (
        <div class="rounded-xl border border-gray-400 bg-slate-200 p-2 dark:border-gray-700 dark:bg-gray-850">
            <div class="p-2 pt-0 font-semibold text-xl">Genre</div>
            <nav class="rounded-xl border border-gray-400 bg-slate-300 p-4 py-2 leading-relaxed dark:border-gray-700 dark:bg-gray-800">
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
            </nav>
            <div class="p-2 font-semibold text-xl">Recent</div>
            <nav class="rounded-xl border border-gray-400 bg-slate-300 p-4 py-2 leading-relaxed dark:border-gray-700 dark:bg-gray-800">
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
            </nav>
            <div
                id="sidebarButtonArea" //
                class="fixed bottom-0 mb-[0.2rem] ml-10"
            >
                <ToggleDarkmodeButton />
                <GithubLinkButton />
                <TwitterLinkButton />
            </div>
        </div>
    );
};
