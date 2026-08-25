import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const FRONTEND_LOGIN_URL = `${import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}/login`;

export default function Handoff() {
  const [searchParams] = useSearchParams();
  const { loginWithTokens } = useAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const at = searchParams.get("at");
    const rt = searchParams.get("rt");
    if (!at || !rt) {
      setError("Thiếu thông tin đăng nhập");
      return;
    }
    loginWithTokens(at, rt)
      .then(() => navigate("/", { replace: true }))
      .catch((err) => setError(err.message || "Đăng nhập thất bại"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zm-bg bg-noise flex items-center justify-center p-6">
      {error ? (
        <div className="text-center flex flex-col gap-3 max-w-sm">
          <p className="text-sm text-zm-heart font-medium">{error}</p>
          <a
            href={FRONTEND_LOGIN_URL}
            className="inline-flex items-center justify-center bg-gradient-to-r from-zm-blue to-zm-blue-light text-white font-bold rounded-lg min-h-11 px-4 text-sm hover:opacity-90 transition-opacity"
          >
            Quay lại đăng nhập
          </a>
        </div>
      ) : (
        <p className="text-sm text-zm-muted">Đang đăng nhập...</p>
      )}
    </div>
  );
}
