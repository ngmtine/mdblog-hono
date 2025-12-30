import { SITE_TITLE } from "../../lib/constants";

export const AboutPage = () => (
    <div>
        <title>About - {SITE_TITLE}</title>
        <h1 class="mb-8 font-bold text-4xl">About</h1>
        <div class="space-y-4">
            <p>Welcome to {SITE_TITLE}. This is a blog built with HonoX and deployed on Cloudflare Workers.</p>
            <p>This site uses static site generation (SSG) to deliver fast, reliable content from the edge.</p>
        </div>
    </div>
);
