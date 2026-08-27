import { useEffect, useState } from "react";
import { FaHistory, FaFilter, FaTimes, FaDownload } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Pagination from "../components/common/Pagination";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatRelativeTime } from "../utils/time";

const PAGE_SIZE = 30;

const ACTION_LABELS = {
  BAN_USER: "Khoá tài khoản",
  UNBAN_USER: "Mở khoá tài khoản",
  DELETE_USER: "Xoá tài khoản",
  HIDE_POST: "Ẩn bài viết",
  UNHIDE_POST: "Hiện bài viết",
  DELETE_POST: "Xoá bài viết",
  DELETE_FORUM_MESSAGE: "Xoá tin nhắn diễn đàn",
  CLEAR_FORUM_MESSAGES: "Dọn dẹp tin nhắn trong phòng",
  HIDE_FORUM_MESSAGE: "Ẩn tin nhắn diễn đàn",
  UNHIDE_FORUM_MESSAGE: "Hiện tin nhắn diễn đàn",
  DELETE_CHAT_MESSAGE: "Xoá tin nhắn chat",
  HIDE_COMMENT: "Ẩn bình luận",
  UNHIDE_COMMENT: "Hiện bình luận",
  DELETE_COMMENT: "Xoá bình luận",
};

const TARGET_TYPE_LABELS = {
  USER: "Người dùng",
  POST: "Bài viết",
  FORUM_MESSAGE: "Tin nhắn diễn đàn",
  FORUM_ROOM: "Phòng diễn đàn",
  CHAT_MESSAGE: "Tin nhắn chat",
  COMMENT: "Bình luận",
};

const ACTION_COLORS = {
  BAN_USER: "bg-red-500/15 text-red-400",
  DELETE_USER: "bg-red-500/15 text-red-400",
  DELETE_POST: "bg-red-500/15 text-red-400",
  DELETE_FORUM_MESSAGE: "bg-red-500/15 text-red-400",
  CLEAR_FORUM_MESSAGES: "bg-red-500/15 text-red-400",
  DELETE_CHAT_MESSAGE: "bg-red-500/15 text-red-400",
  DELETE_COMMENT: "bg-red-500/15 text-red-400",
  HIDE_POST: "bg-zm-orange/15 text-zm-orange",
  HIDE_FORUM_MESSAGE: "bg-zm-orange/15 text-zm-orange",
  HIDE_COMMENT: "bg-zm-orange/15 text-zm-orange",
  UNBAN_USER: "bg-emerald-500/15 text-emerald-400",
  UNHIDE_POST: "bg-emerald-500/15 text-emerald-400",
  UNHIDE_FORUM_MESSAGE: "bg-emerald-500/15 text-emerald-400",
  UNHIDE_COMMENT: "bg-emerald-500/15 text-emerald-400",
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [reloadTick, setReloadTick] = useState(0);

  const [adminId, setAdminId] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const hasActiveFilters = adminId || action || fromDate || toDate;

  const currentFilters = () => ({
    adminId: adminId || undefined,
    action: action || undefined,
    from: fromDate ? `${fromDate}T00:00:00Z` : undefined,
    to: toDate ? `${toDate}T23:59:59Z` : undefined,
  });

  useEffect(() => {
    adminApi
      .listAdmins()
      .then(setAdmins)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listAuditLog(page, PAGE_SIZE, currentFilters())
      .then((res) => {
        setLogs(res.content);
        setTotalPages(res.totalPages);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, adminId, action, fromDate, toDate, reloadTick]);

  const resetFilters = () => {
    setAdminId("");
    setAction("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await adminApi.exportAuditLogCsv(currentFilters());
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(err.message || "Không thể xuất file CSV");
    } finally {
      setExporting(false);
    }
  };

  const inputClass =
    "min-h-11 rounded-xl border border-zm-border bg-zm-bg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zm-blue/50";

  return (
    <>
      <AdminHeader title="Nhật ký thao tác" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="bg-zm-card rounded-2xl border border-zm-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zm-blue to-zm-blue-light flex items-center justify-center text-white glow-violet shrink-0">
            <FaHistory size={16} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-sm">Lịch sử thao tác quản trị</p>
            <p className="text-xs text-zm-muted">Ghi lại mọi hành động huỷ hoại (khoá/xoá) do quản trị viên thực hiện.</p>
          </div>
        </div>

        <div className="bg-zm-card rounded-2xl border border-zm-border p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-zm-muted">
              <FaFilter size={12} aria-hidden="true" />
              Bộ lọc
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl text-sm font-semibold bg-zm-blue/15 text-zm-blue hover:bg-zm-blue/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload size={12} aria-hidden="true" />
              {exporting ? "Đang xuất..." : "Xuất CSV"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={adminId}
              onChange={(e) => {
                setAdminId(e.target.value);
                setPage(0);
              }}
              className={inputClass}
            >
              <option value="">Tất cả quản trị viên</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name || a.email}
                </option>
              ))}
            </select>

            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(0);
              }}
              className={inputClass}
            >
              <option value="">Tất cả hành động</option>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              className={inputClass}
              aria-label="Từ ngày"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              className={inputClass}
              aria-label="Đến ngày"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-start flex items-center gap-1.5 min-h-11 px-3 text-sm text-zm-muted hover:text-zm-text transition-colors"
            >
              <FaTimes size={12} aria-hidden="true" />
              Xoá bộ lọc
            </button>
          )}
        </div>

        {error && <ErrorBanner onRetry={() => setReloadTick((t) => t + 1)} />}

        <div className="bg-zm-card rounded-2xl border border-zm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zm-muted uppercase tracking-wide border-b border-zm-border">
                  <th className="px-4 py-3 font-semibold">Quản trị viên</th>
                  <th className="px-4 py-3 font-semibold">Hành động</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Đối tượng</th>
                  <th className="px-4 py-3 font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-zm-border last:border-0">
                    <td className="px-4 py-3 max-w-[38vw] sm:max-w-none">
                      <p className="font-medium truncate">{log.adminName || log.adminEmail}</p>
                      <p className="text-xs text-zm-muted truncate">{log.adminEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          ACTION_COLORS[log.action] || "bg-zm-muted/15 text-zm-muted"
                        }`}
                      >
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zm-muted hidden sm:table-cell">
                      <span>{TARGET_TYPE_LABELS[log.targetType] || log.targetType}</span>
                      {log.details && <span className="ml-1.5 text-xs">({log.details})</span>}
                    </td>
                    <td className="px-4 py-3 text-zm-muted whitespace-nowrap">{formatRelativeTime(log.createdAt)}</td>
                  </tr>
                ))}
                {!loading && !error && logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-zm-muted text-sm">
                      Chưa có thao tác nào được ghi nhận.
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
