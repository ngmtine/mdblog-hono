import { ssgParams } from "hono/ssg";
import { createRoute } from "honox/factory";

import { GenrePage } from "../../components/pages/GenrePage";
import { getAllPosts } from "../../lib/posts";

// SSG: Generate static files for each genre
export const ssg = ssgParams(async () => {
    const posts = await getAllPosts();
    const genreList = [
        ...new Set(
            posts
                .map((post) => post.frontmatter.genre) //
                .filter((genre): genre is string => Boolean(genre)),
        ),
    ];
    return genreList.map((genre) => ({ genre: genre.toLowerCase() }));
});

export default createRoute(async (c) => {
    const genre = c.req.param("genre");
    if (!genre) return c.notFound();

    const posts = await getAllPosts();
    const filteredPosts = posts.filter(
        (post) => post.frontmatter.genre?.toLowerCase() === genre.toLowerCase(), //
    );
    if (filteredPosts.length === 0) return c.notFound();

    return c.render(
        <GenrePage
            genre={genre} //
            posts={filteredPosts}
        />,
    );
});
