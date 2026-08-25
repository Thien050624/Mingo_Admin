import { useEffect, useState } from "react";
import { FaFlag, FaTrash, FaComments, FaEye, FaEyeSlash, FaBroom } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatRelativeTime } from "../utils/time";

const PAGE_SIZE = 15;

export default function ForumModeration() {
  const [messages, setMessages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listForumMessages(page, PAGE_SIZE)
      .then((res) => {
        setMessages(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, reloadTick]);

  const removeMessage = async (m) => {
    if (!window.confirm(`Xoá vĩnh viễn tin nhắn của ${m.author.name}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deleteForumMessage(m.id);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      window.alert(err.message || "Không thể xoá tin nhắn");
    }
  };

  const clearAllMessages = async () => {
    if (
      !window.confirm(
        "Xoá vĩnh viễn TOÀN BỘ tin nhắn diễn đàn của mọi người dùng? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      await adminApi.clearForumMessages();
      setMessages([]);
      setTotalElements(0);
      setTotalPages(0);
      setPage(0);
    } catch (err) {
      window.alert(err.message || "Không thể dọn dẹp tin nhắn diễn đàn");
    } finally {
      setClearing(false);
    }
  };

  const toggleHidden = async (m) => {
    try {
      await adminApi.setForumMessageHidden(m.id, !m.hidden);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, hidden: !m.hidden } : x)));
    } catch (err) {
      window.alert(err.message || "Không thể cập nhật tin nhắn");
    }
  };

  return (
    <>
      <AdminHeader title="Diễn đàn" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="bg-zm-card rounded-2xl border border-zm-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zm-blue to-zm-blue-light flex items-center justify-center text-white glow-violet shrink-0">
            <FaComments size={16} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Phòng chat chung Mingo</p>
            <p className="text-xs text-zm-muted">
              {totalElements} tin nhắn bị báo cáo cần xử lý
            </p>
          </div>
          <button
            type="button"
            onClick={clearAllMessages}
            disabled={clearing}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-11 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            <FaBroom size={11} aria-hidden="true" /> {clearing ? "Đang dọn dẹp..." : "Dọn dẹp toàn bộ"}
          </button>
        </div>

        {error && <ErrorBanner onRetry={() => setReloadTick((t) => t + 1)} />}

        <div className="bg-zm-card rounded-2xl border border-zm-border overflow-hidden">
          <div className="flex flex-col divide-y divide-zm-border">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 p-4 ${m.reports > 0 ? "bg-zm-orange/5" : ""}`}
              >
                <Avatar src={m.author.avatar} name={m.author.name} alt="" className="w-9 h-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{m.author.name}</p>
                    <span className="text-xs text-zm-muted">{formatRelativeTime(m.createdAt)}</span>
                    {m.reports > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-zm-orange bg-zm-orange/15 px-2 py-0.5 rounded-full">
                        <FaFlag size={9} aria-hidden="true" /> {m.reports} báo cáo
                      </span>
                    )}
                    {m.hidden && (
                      <span className="text-[11px] font-semibold text-zm-muted bg-zm-muted/15 px-2 py-0.5 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{m.content ?? "(Tin nhắn đã bị thu hồi)"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleHidden(m)}
                    aria-label={m.hidden ? `Hiện tin nhắn của ${m.author.name}` : `Ẩn tin nhắn của ${m.author.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-zm-blue-light hover:bg-zm-hover transition-colors"
                  >
                    {m.hidden ? <FaEye size={13} aria-hidden="true" /> : <FaEyeSlash size={13} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMessage(m)}
                    aria-label={`Xoá tin nhắn của ${m.author.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <FaTrash size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
            {!loading && !error && messages.length === 0 && (
              <div className="p-10 text-center text-zm-muted text-sm">
                Không có tin nhắn nào bị báo cáo.
              </div>
            )}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
