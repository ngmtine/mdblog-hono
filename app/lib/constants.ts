// Posts directory configuration
export const POSTS_DIRECTORY = `${import.meta.env.VITE_POSTS_REPO_DIR}/posts`;

// Site configuration
export const SITE_TITLE = import.meta.env.VITE_SITE_TITLE ?? "My HonoX Blog";
export const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? "";
export const TWITTER_USERNAME = import.meta.env.VITE_TWITTER_USERNAME ?? "";

// Base URL (開発環境と本番環境で分岐)
export const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_BASE_URL_DEV : import.meta.env.VITE_BASE_URL_PROD;
