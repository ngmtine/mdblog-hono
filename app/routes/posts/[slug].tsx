import { createRoute } from "honox/factory";
import { getPostBySlug } from "../../lib/posts";

export default createRoute(async (c) => {
    const { slug } = c.req.param() as { slug: string };

    if (!slug) {
        return c.notFound();
    }

    const post = await getPostBySlug({ directory: "dummy-posts", slug });
    console.log(post?.content);

    return c.render(
        <div>
            <h1>{post}</h1>
            <div dangerouslySetInnerHTML={{ __html: post?.content ?? "" }} />
        </div>,
    );
});
