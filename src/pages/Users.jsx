import { useEffect, useState } from "react";
import { FaSearch, FaBan, FaCheck, FaTrash } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatDate } from "../utils/time";

const PAGE_SIZE = 10;

const statusLabel = { ACTIVE: "Hoạt động", BANNED: "Đã khoá" };
const statusClass = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  BANNED: "bg-red-500/15 text-red-400",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      adminApi
        .listUsers(query, page, PAGE_SIZE)
        .then((res) => {
          setUsers(res.content);
          setTotalPages(res.totalPages);
          setError(false);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, page, reloadTick]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(0);
  };

  const toggleBan = async (u) => {
    const banned = u.status !== "BANNED";
    if (banned && !window.confirm(`Khoá tài khoản của ${u.name || u.email}?`)) {
      return;
    }
    try {
      const updated = await adminApi.setUserBanned(u.id, banned);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      window.alert(err.message || "Không thể cập nhật trạng thái người dùng");
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Xoá vĩnh viễn tài khoản của ${u.name || u.email}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      window.alert(err.message || "Không thể xoá tài khoản");
    }
  };

  return (
    <>
      <AdminHeader title="Người dùng" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center bg-zm-card border border-zm-border rounded-full px-4 h-11 max-w-sm">
          <FaSearch className="text-zm-muted text-sm shrink-0" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            aria-label="Tìm kiếm người dùng theo tên hoặc email"
            placeholder="Tìm theo tên hoặc email..."
            className="bg-transparent outline-none px-3 text-sm flex-1 placeholder-zm-muted"
          />
        </div>

        {error && <ErrorBanner onRetry={() => setReloadTick((t) => t + 1)} />}

        <div className="bg-zm-card rounded-2xl border border-zm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zm-muted uppercase tracking-wide border-b border-zm-border">
                  <th className="px-4 py-3 font-semibold">Người dùng</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Ngày tham gia</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Bài viết</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-zm-border last:border-0 hover:bg-zm-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} name={u.name || u.email} alt="" className="w-9 h-9 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-zm-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zm-muted hidden sm:table-cell">{formatDate(u.joined)}</td>
                    <td className="px-4 py-3 text-zm-muted hidden md:table-cell">{u.posts}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[u.status]}`}>
                        {statusLabel[u.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role === "ADMIN" ? (
                        <span className="text-xs text-zm-muted">Quản trị viên</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleBan(u)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-11 rounded-lg border transition-colors ${
                              u.status === "BANNED"
                                ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                                : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                            }`}
                          >
                            {u.status === "BANNED" ? (
                              <>
                                <FaCheck size={10} aria-hidden="true" /> Mở khoá
                              </>
                            ) : (
                              <>
                                <FaBan size={10} aria-hidden="true" /> Khoá
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeUser(u)}
                            aria-label={`Xoá tài khoản của ${u.name || u.email}`}
                            className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <FaTrash size={11} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && !error && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-zm-muted text-sm">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
