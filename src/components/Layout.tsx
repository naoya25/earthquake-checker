import { Link, NavLink, useNavigate } from "react-router-dom";
import { useRef } from "react";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFooterIconClick = () => {
    clickCountRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      navigate("/admin");
      return;
    }
    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 font-medium transition-colors duration-100 ease-standard ${
      isActive
        ? "text-primary after:absolute after:-bottom-[13px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
        : "text-neutral-500 hover:text-neutral-800"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity duration-100 ease-standard hover:opacity-80"
          >
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="icon"
              className="w-8 h-8 object-contain"
            />
            <span className="text-h3 font-semibold text-neutral-900 tracking-tight">
              地震チェッカー
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" end className={navLinkClass}>
              ホーム
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              このアプリについて
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-neutral-400">
          <div className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="icon"
              className="w-5 h-5 object-contain opacity-60"
              onClick={handleFooterIconClick}
            />
            <span>地震チェッカー</span>
          </div>
          <span>
            © {new Date().getFullYear()} 地震チェッカー. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
