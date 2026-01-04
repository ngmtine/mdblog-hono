import type { AppEnv } from "./lib/db";

declare module "hono" {
    // Cloudflare Workers Bindings
    interface Env {
        Bindings: AppEnv;
    }
}

interface ImportMetaEnv {
    readonly VITE_POSTS_REPO_DIR: string;
    readonly VITE_BASE_URL: string;
    readonly VITE_DB_CONNECTION_STRING: string;
    readonly VITE_AUTHOR: string;
}

// biome-ignore lint/correctness/noUnusedVariables: Vite環境変数の型拡張
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
