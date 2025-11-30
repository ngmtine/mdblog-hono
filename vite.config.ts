import { cloudflare } from "@cloudflare/vite-plugin";
import adapter from "@hono/vite-dev-server/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

const config = defineConfig({
    plugins: [
        cloudflare(),
        ssrPlugin(),
        tailwindcss(),
        honox({
            devServer: { adapter },
            client: { input: ["/src/client.ts", "/src/style.css"] },
        }),
    ],
});

export default config;
