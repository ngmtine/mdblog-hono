import devServer from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        tailwindcss(),
        devServer({
            entry: "src/index.tsx",
        }),
    ],
});
