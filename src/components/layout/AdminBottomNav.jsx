import { Link, useLocation } from "react-router-dom";
import { FaChartPie, FaUsers, FaFileAlt, FaComments, FaCommentDots, FaHistory } from "react-icons/fa";

const items = [
  { to: "/", label: "Tổng quan", icon: FaChartPie },
  { to: "/users", label: "Người dùng", icon: FaUsers },
  { to: "/posts", label: "Bài viết", icon: FaFileAlt },
  { to: "/forum", label: "Diễn đàn", icon: FaComments },
  { to: "/chat", label: "Tin nhắn", icon: FaCommentDots },
  { to: "/audit-log", label: "Nhật ký", icon: FaHistory },
];

export default function AdminBottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zm-card/95 backdrop-blur-xl border-t border-zm-border flex items-stretch h-16 pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? "text-zm-blue-light" : "text-zm-muted"
            }`}
          >
            <Icon size={19} aria-hidden="true" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
