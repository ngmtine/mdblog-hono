import { useEffect, useRef, useState } from "hono/jsx";

import { SITE_TITLE } from "../lib/constants";
import { ThemeSwitcher } from "./$themeSwitcher";

export const Header = () => {
    const headerRef = useRef<HTMLElement>(null);
    const position = useRef(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const headerElement = headerRef.current;
        if (!headerElement) return;

        const handleScroll = () => {
            const currentScrollY = document.documentElement.scrollTop;
            if (Number(position.current) < currentScrollY) {
                // 下スクロール
                headerElement.classList.add("-translate-y-full");
                headerElement.classList.remove("translate-y-0");
            } else {
                // 上スクロール
                headerElement.classList.add("translate-y-0");
                headerElement.classList.remove("-translate-y-full");
            }
            position.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            ref={headerRef} //
            class="fixed top-0 z-50 w-full translate-y-0 bg-white/80 shadow-md backdrop-blur-xs transition-transform duration-300 dark:bg-gray-900/80"
        >
            <div class="flex justify-center">
                <div class="flex w-full max-w-5xl items-center justify-between p-4">
                    <a href="/" class="font-bold text-2xl">
                        {SITE_TITLE}
                    </a>
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <nav class={`${isMenuOpen ? "block" : "hidden"} absolute top-full left-0 w-full md:relative md:top-auto md:left-auto md:block md:w-auto`}>
                                <ul class="flex flex-col rounded-md bg-white p-4 shadow-lg md:flex-row md:space-x-4 md:bg-transparent md:p-0 md:shadow-none dark:bg-gray-800">
                                    <li>
                                        <a href="/" class="hover:underline">
                                            Home
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/posts" //
                                            class="hover:underline"
                                        >
                                            Posts
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/about" //
                                            class="hover:underline"
                                        >
                                            About
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <ThemeSwitcher />
                        <button
                            class="md:hidden" //
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            aria-label="Toggle menu"
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
                                <title id="menu-icon-title">Menu</title>
                                <path
                                    strokeLinecap="round" //
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
