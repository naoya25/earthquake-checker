import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  const { pathname } = useLocation();
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="icon"
              className="w-9 h-9 object-contain"
            />
            <span className="text-lg font-bold text-gray-800 tracking-tight">
              地震チェッカー
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                pathname === "/"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              ホーム
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors ${
                pathname === "/about"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              このアプリについて
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
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
