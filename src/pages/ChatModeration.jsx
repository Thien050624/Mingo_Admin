import { useEffect, useState } from "react";
import { FaFlag, FaTrash, FaCommentDots } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatRelativeTime } from "../utils/time";

const PAGE_SIZE = 15;

export default function ChatModeration() {
  const [messages, setMessages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listChatMessageReports(page, PAGE_SIZE)
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
    if (!window.confirm(`Xoá vĩnh viễn tin nhắn của ${m.sender.name}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deleteChatMessage(m.id);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      window.alert(err.message || "Không thể xoá tin nhắn");
    }
  };

  return (
    <>
      <AdminHeader title="Tin nhắn" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="bg-zm-card rounded-2xl border border-zm-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zm-blue to-zm-blue-light flex items-center justify-center text-white glow-violet shrink-0">
            <FaCommentDots size={16} aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-sm">Tin nhắn 1-1 &amp; nhóm chat</p>
            <p className="text-xs text-zm-muted">
              {totalElements} tin nhắn bị báo cáo cần xử lý
            </p>
          </div>
        </div>

        {error && <ErrorBanner onRetry={() => setReloadTick((t) => t + 1)} />}

        <div className="bg-zm-card rounded-2xl border border-zm-border overflow-hidden">
          <div className="flex flex-col divide-y divide-zm-border">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-4 bg-zm-orange/5">
                <Avatar src={m.sender.avatar} name={m.sender.name} alt="" className="w-9 h-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{m.sender.name}</p>
                    <span className="text-xs text-zm-muted">{formatRelativeTime(m.createdAt)}</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-zm-orange bg-zm-orange/15 px-2 py-0.5 rounded-full">
                      <FaFlag size={9} aria-hidden="true" /> {m.reports} báo cáo
                    </span>
                  </div>
                  <p className="text-sm mt-1">{m.content ?? "(Tin nhắn đã bị thu hồi)"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMessage(m)}
                  aria-label={`Xoá tin nhắn của ${m.sender.name}`}
                  className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <FaTrash size={13} aria-hidden="true" />
                </button>
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
