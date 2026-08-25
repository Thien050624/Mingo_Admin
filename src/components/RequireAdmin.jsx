import { useAdminAuth } from "../context/AdminAuthContext";

const FRONTEND_LOGIN_URL = `${(import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "")}/login`;

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zm-bg bg-noise flex items-center justify-center">
        <p className="text-sm text-zm-muted">Đang tải...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-zm-bg bg-noise flex items-center justify-center p-6">
        <div className="text-center flex flex-col gap-3 max-w-sm">
          <p className="text-sm text-zm-muted">
            Bạn cần đăng nhập bằng tài khoản quản trị viên để truy cập trang này.
          </p>
          <a
            href={FRONTEND_LOGIN_URL}
            className="inline-flex items-center justify-center bg-gradient-to-r from-zm-blue to-zm-blue-light text-white font-bold rounded-lg min-h-11 px-4 text-sm hover:opacity-90 transition-opacity"
          >
            Đến trang đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return children;
}
