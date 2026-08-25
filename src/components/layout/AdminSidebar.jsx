import { Link, useLocation } from "react-router-dom";
import { FaChartPie, FaUsers, FaFileAlt, FaComments, FaCommentDots, FaShieldAlt, FaHistory } from "react-icons/fa";
import { useAdminAuth } from "../../context/AdminAuthContext";
import LetterAvatar from "../common/LetterAvatar";

const items = [
  { to: "/", label: "Tổng quan", icon: FaChartPie },
  { to: "/users", label: "Người dùng", icon: FaUsers },
  { to: "/posts", label: "Bài viết", icon: FaFileAlt },
  { to: "/forum", label: "Diễn đàn", icon: FaComments },
  { to: "/chat", label: "Tin nhắn", icon: FaCommentDots },
  { to: "/audit-log", label: "Nhật ký", icon: FaHistory },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { admin } = useAdminAuth();

  return (
    <aside className="hidden lg:flex w-56 shrink-0 sticky top-0 self-start h-screen flex-col py-5 border-r border-zm-border">
      <div className="flex items-center gap-2.5 px-4 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zm-blue to-zm-blue-light flex items-center justify-center text-white glow-violet shrink-0">
          <FaShieldAlt size={16} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-lg leading-tight glow-text">Mingo</p>
          <p className="text-[11px] text-zm-muted -mt-0.5">Trang quản trị</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-zm-blue to-zm-blue-dark text-white glow-violet"
                  : "text-zm-muted hover:text-zm-blue-light hover:bg-zm-hover"
              }`}
            >
              <Icon size={17} aria-hidden="true" className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-zm-card border border-zm-border">
          <LetterAvatar name={admin.name} className="w-9 h-9 ring-2 ring-zm-blue/40" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{admin.name}</p>
            <p className="text-xs text-zm-muted truncate">{admin.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
