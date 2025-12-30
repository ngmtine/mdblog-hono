import { useEffect, useRef, useState } from "hono/jsx";

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
            className="top-0 z-50 fixed bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur-xs w-full transition-transform translate-y-0 duration-300"
        >
            <div className="flex justify-center">
                <div className="flex justify-between items-center p-4 w-full max-w-5xl">
                    <a href="/" className="font-bold text-2xl">
                        My HonoX Blog
                    </a>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <nav className={`${isMenuOpen ? "block" : "hidden"} md:block absolute md:relative top-full left-0 md:top-auto md:left-auto w-full md:w-auto`}>
                                <ul className="flex md:flex-row flex-col md:space-x-4 bg-white md:bg-transparent dark:bg-gray-800 shadow-lg md:shadow-none p-4 md:p-0 rounded-md">
                                    <li>
                                        <a href="/" className="hover:underline">
                                            Home
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/posts" //
                                            className="hover:underline"
                                        >
                                            Posts
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/about" //
                                            className="hover:underline"
                                        >
                                            About
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <ThemeSwitcher />
                        <button
                            className="md:hidden" //
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6" //
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
