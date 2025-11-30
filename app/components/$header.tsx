import { useEffect, useRef } from "hono/jsx";
import { ThemeSwitcher } from "./$themeSwitcher";

export const Header = () => {
    const headerRef = useRef<HTMLElement>(null);
    const position = useRef(0);

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
            ref={headerRef}
            className="top-0 z-50 fixed bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur-xs w-full transition-transform translate-y-0 duration-300"
        >
            <div className="flex justify-between items-center mx-auto p-4 container">
                <a href="/" className="font-bold text-2xl">
                    My HonoX Blog
                </a>
                <div className="flex items-center space-x-4">
                    <nav className="hidden md:block">
                        <ul className="flex space-x-4">
                            <li>
                                <a href="/" className="hover:underline">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/posts" className="hover:underline">
                                    Posts
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="hover:underline">
                                    About
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
};
