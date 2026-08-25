import { useState } from "react";
import { FaCaretDown, FaSignOutAlt } from "react-icons/fa";
import { useAdminAuth } from "../../context/AdminAuthContext";
import LetterAvatar from "../common/LetterAvatar";

const FRONTEND_LOGIN_URL = `${(import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "")}/login`;

export default function AdminHeader({ title }) {
  const { admin, logout } = useAdminAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = FRONTEND_LOGIN_URL;
  };

  return (
    <header className="h-16 border-b border-zm-border flex items-center justify-between px-4 sm:px-6 shrink-0">
      <h1 className="font-bold text-lg">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Mở menu tài khoản"
          aria-expanded={showMenu}
          className="flex items-center gap-2 pl-1 pr-2 min-h-11 rounded-full bg-zm-bg hover:bg-zm-hover border border-zm-border transition-colors"
        >
          <LetterAvatar name={admin.name} className="w-8 h-8 text-sm ring-2 ring-zm-blue/50" />
          <FaCaretDown className="text-zm-muted text-xs" aria-hidden="true" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-12 w-52 bg-zm-card rounded-xl shadow-2xl border border-zm-border py-2 text-sm glow-violet z-20">
            <div className="px-4 py-2">
              <p className="font-semibold">{admin.name}</p>
              <p className="text-xs text-zm-muted truncate">{admin.email}</p>
            </div>
            <hr className="my-2 border-zm-border" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 min-h-11 hover:bg-zm-hover text-zm-text text-left"
            >
              <FaSignOutAlt size={13} aria-hidden="true" className="text-zm-muted" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
