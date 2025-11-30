import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { getPostBySlug, getPosts } from "./lib/posts";
import { renderer } from "./renderer";

declare module "hono" {
    interface ContextRenderer {
        // biome-ignore lint/style/useShorthandFunctionType: _
        (
            content: string | Promise<string>, //
            props: Variables,
        ): Response;
    }
}

type Variables = {
    title: string;
};

const app = new Hono<{ Variables: Variables }>();

const POSTS_DIRECTORY = "./posts";

app.use(
    jsxRenderer(({ children, title }) => {
        return renderer({ children, title });
    }),
);

app.get("/", async (c) => {
    const posts = await getPosts(POSTS_DIRECTORY);
    return c.render(
        <div class="p-4">
            <h1 class="text-3xl font-bold mb-4">Blog Posts</h1>
            <ul class="space-y-4">
                {posts.map((post) => (
                    <li key={post.slug} class="bg-white p-4 rounded shadow">
                        <a
                            href={`/posts/${post.slug}`}
                            class="text-xl font-semibold text-blue-600 hover:underline"
                        >
                            {post.frontmatter.title}
                        </a>
                        <p class="text-gray-600 text-sm">
                            {new Date(
                                post.frontmatter.date,
                            ).toLocaleDateString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>,
        { title: "Home" },
    );
});

app.get("/posts/:slug", async (c) => {
    const { slug } = c.req.param();
    const post = await getPostBySlug(POSTS_DIRECTORY, slug);

    if (!post) {
        return c.notFound();
    }

    return c.render(
        <div class="p-4">
            <h1 class="text-3xl font-bold mb-4">{post.frontmatter.title}</h1>
            <p class="text-gray-600 text-sm mb-4">
                {new Date(post.frontmatter.date).toLocaleDateString()}
            </p>
            <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                class="prose lg:prose-xl"
            ></div>
        </div>,
        { title: post.frontmatter.title },
    );
});

export default app;
