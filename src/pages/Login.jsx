import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAdminAuth } from "../context/AdminAuthContext";
import useSlowLoad from "../hooks/useSlowLoad";

export default function Login() {
  const { login, admin } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitSlow = useSlowLoad(submitting);

  if (admin) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zm-bg bg-noise flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zm-card rounded-2xl shadow-2xl border border-zm-border overflow-hidden glow-violet p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zm-blue to-zm-blue-light flex items-center justify-center font-black text-white text-2xl mb-3">
            M
          </div>
          <h1 className="text-lg font-bold">Mingo Admin</h1>
          <p className="text-sm text-zm-muted mt-1">Đăng nhập bằng tài khoản quản trị viên</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 bg-zm-bg border border-zm-border rounded-lg px-3 h-11">
            <FaEnvelope className="text-zm-muted shrink-0" size={14} aria-hidden="true" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-zm-muted"
            />
          </div>

          <div className="flex items-center gap-2.5 bg-zm-bg border border-zm-border rounded-lg px-3 h-11">
            <FaLock className="text-zm-muted shrink-0" size={14} aria-hidden="true" />
            <input
              type="password"
              required
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Mật khẩu"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-zm-muted"
            />
          </div>

          {error && <p className="text-xs text-zm-heart font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-zm-blue to-zm-blue-light disabled:opacity-60 hover:opacity-90 text-white font-bold rounded-lg min-h-11 text-sm mt-2 transition-opacity"
          >
            {submitting
              ? submitSlow
                ? "Máy chủ đang khởi động, vui lòng đợi thêm ít giây..."
                : "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
