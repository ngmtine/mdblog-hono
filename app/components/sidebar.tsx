import type { PostMeta } from "../lib/posts";

type Props = {
    posts: PostMeta[];
    categories: string[];
};

export function Sidebar({ posts, categories }: Props) {
    return (
        <aside className="w-64 bg-gray-800 text-white p-4 space-y-6">
            <div className="text-xl font-semibold">Categories</div>
            <nav>
                <ul className="space-y-2">
                    {categories.map((category) => (
                        <li key={category}>
                            <a
                                href={`/category/${category.toLowerCase()}`}
                                className="block hover:text-blue-400"
                            >
                                {category}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="text-xl font-semibold">Recent Posts</div>
            <nav>
                <ul className="space-y-2">
                    {posts.map((post) => (
                        <li key={post.slug}>
                            <a
                                href={`/posts/${post.slug}`}
                                className="block hover:text-blue-400"
                            >
                                {post.frontmatter.title ?? post.slug}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
