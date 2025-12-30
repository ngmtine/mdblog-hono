import { ToggleDarkmodeButton } from "./functionalIcons/$toggleDarkmodeButton";
import { GithubLinkButton } from "./functionalIcons/githubLinkButton";
import { TwitterLinkButton } from "./functionalIcons/twitterLinkButton";
import type { Post } from "../lib/posts";

type Props = {
    posts: Post[];
    categories: string[];
};

export const Sidebar = (props: Props) => {
    const { posts, categories } = props;
    return (
        <div class="rounded-xl bg-slate-200 p-2 dark:bg-gray-850">
            <div class="p-2 pt-0 font-semibold text-xl">Genre</div>
            <nav class="rounded-xl bg-slate-300 p-4 leading-relaxed dark:bg-gray-800">
                <ul>
                    {categories.map((category) => (
                        <li key={category}>
                            <a
                                href={`/category/${category.toLowerCase()}`} //
                                class="block hover:text-blue-400"
                            >
                                {category}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div class="p-2 font-semibold text-xl">Recent</div>
            <nav class="rounded-xl bg-slate-300 p-4 leading-relaxed dark:bg-gray-800">
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
