import { createRoute } from "honox/factory";

import { IndexPage } from "../components/pages/indexPage";
import { getAllPosts } from "../lib/posts";

export default createRoute(async (c) => {
    const posts = await getAllPosts();
    return c.render(<IndexPage posts={posts} />);
});
