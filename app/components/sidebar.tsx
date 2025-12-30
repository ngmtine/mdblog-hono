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
        <div className="space-y-6 bg-gray-800 p-4 rounded-xl text-white">
            <div className="font-semibold text-xl">Categories</div>
            <nav>
                <ul className="space-y-2">
                    {categories.map((category) => (
                        <li key={category}>
                            <a
                                href={`/category/${category.toLowerCase()}`} //
                                className="block hover:text-blue-400"
                            >
                                {category}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="font-semibold text-xl">Recent Posts</div>
            <nav>
                <ul className="space-y-2">
                    {posts.map((post) => (
                        <li key={post.slug}>
                            <a
                                href={`/posts/${post.slug}`} //
                                className="block hover:text-blue-400"
                            >
                                {post.frontmatter.title ?? post.slug}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div
                id="sidebarButtonArea" //
                class="bottom-0 fixed mb-[0.2rem] ml-10"
            >
                <ToggleDarkmodeButton />
                <GithubLinkButton />
                <TwitterLinkButton />
            </div>
        </div>
    );
};
