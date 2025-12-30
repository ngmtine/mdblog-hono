import { SITE_TITLE } from "../../lib/constants";

export const AboutPage = () => (
    <div class="rounded-xl bg-slate-200 p-2 dark:bg-gray-850">
        <h1 class="p-2 font-bold text-4xl">About</h1>
        <div class="rounded-xl bg-slate-300 p-4 leading-relaxed dark:bg-gray-800">
            <p>Welcome to {SITE_TITLE}. This is a blog built with HonoX and deployed on Cloudflare Workers.</p>
            <p>This site uses static site generation (SSG) to deliver fast, reliable content from the edge.</p>
        </div>
    </div>
);
