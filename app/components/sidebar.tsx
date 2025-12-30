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
        <div class="space-y-6 rounded-xl bg-gray-800 p-4 text-white">
            <div class="font-semibold text-xl">Categories</div>
            <nav>
                <ul class="space-y-2">
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
            <div class="font-semibold text-xl">Recent Posts</div>
            <nav>
                <ul class="space-y-2">
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
