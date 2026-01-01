import { useEffect, useState } from "hono/jsx";

import { SITE_TITLE } from "../lib/constants";

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // メニュー開閉時にサイドバーとオーバーレイを制御
    useEffect(() => {
        const sidebar = document.getElementById("mobile-sidebar");
        const overlay = document.getElementById("mobile-sidebar-overlay");

        if (!sidebar || !overlay) return;

        if (isMenuOpen) {
            sidebar.classList.remove("-translate-x-full");
            sidebar.classList.add("translate-x-0");
            overlay.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        } else {
            sidebar.classList.add("-translate-x-full");
            sidebar.classList.remove("translate-x-0");
            overlay.classList.add("hidden");
            document.body.style.overflow = "";
        }
    }, [isMenuOpen]);

    // オーバーレイクリックでメニューを閉じる
    useEffect(() => {
        const overlay = document.getElementById("mobile-sidebar-overlay");
        if (!overlay) return;

        const handleOverlayClick = () => setIsMenuOpen(false);
        overlay.addEventListener("click", handleOverlayClick);
        return () => overlay.removeEventListener("click", handleOverlayClick);
    }, []);

    // ヘッダーのスクロール時の表示/非表示制御
    useEffect(() => {
        const headerElement = document.getElementById("main-header");
        if (!headerElement) return;

        let position = 0;

        const handleScroll = () => {
            const currentScrollY = document.documentElement.scrollTop;
            if (position < currentScrollY) {
                // 下スクロール
                headerElement.classList.add("-translate-y-full");
                headerElement.classList.remove("translate-y-0");
            } else {
                // 上スクロール
                headerElement.classList.add("translate-y-0");
                headerElement.classList.remove("-translate-y-full");
            }
            position = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            id="main-header" //
            class="fixed top-0 z-50 w-full translate-y-0 bg-white/80 shadow-md backdrop-blur-xs transition-transform duration-300 dark:bg-gray-900/80"
        >
            <div class="flex justify-center">
                <div class="flex w-full max-w-5xl items-center justify-between p-4">
                    <a href="/" class="font-bold text-2xl">
                        {SITE_TITLE}
                    </a>
                    <div class="flex items-center space-x-4">
                        <button
                            class="md:hidden" //
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMenuOpen}
                        >
                            <svg
                                class="h-6 w-6" //
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                role="img"
                                aria-labelledby="menu-icon-title"
                            >
                                <title id="menu-icon-title">{isMenuOpen ? "Close" : "Menu"}</title>
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round" //
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round" //
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
