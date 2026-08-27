import { useEffect, useState } from "react";
import { FaFlag, FaTrash, FaCommentDots, FaEye, FaEyeSlash } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatRelativeTime } from "../utils/time";

const PAGE_SIZE = 15;

export default function CommentModeration() {
  const [comments, setComments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listCommentReports(page, PAGE_SIZE)
      .then((res) => {
        setComments(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, reloadTick]);

  const removeComment = async (c) => {
    if (!window.confirm(`Xoá vĩnh viễn bình luận của ${c.author.name}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deleteComment(c.id);
      setComments((prev) => prev.filter((x) => x.id !== c.id));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch (err) {
      window.alert(err.message || "Không thể xoá bình luận");
    }
  };

  const toggleHidden = async (c) => {
    try {
      await adminApi.setCommentHidden(c.id, !c.hidden);
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, hidden: !c.hidden } : x)));
    } catch (err) {
      window.alert(err.message || "Không thể cập nhật bình luận");
    }
  };

  return (
    <>
      <AdminHeader title="Bình luận" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="bg-zm-card rounded-2xl border border-zm-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zm-blue to-zm-blue-light flex items-center justify-center text-white glow-violet shrink-0">
            <FaCommentDots size={16} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Bình luận bị báo cáo</p>
            <p className="text-xs text-zm-muted">{totalElements} bình luận cần xử lý</p>
          </div>
        </div>

        {error && <ErrorBanner onRetry={() => setReloadTick((t) => t + 1)} />}

        <div className="bg-zm-card rounded-2xl border border-zm-border overflow-hidden">
          <div className="flex flex-col divide-y divide-zm-border">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`flex items-start gap-3 p-4 ${c.reports > 0 ? "bg-zm-orange/5" : ""}`}
              >
                <Avatar src={c.author.avatar} name={c.author.name} alt="" className="w-9 h-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{c.author.name}</p>
                    <span className="text-xs text-zm-muted">{formatRelativeTime(c.createdAt)}</span>
                    {c.reports > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-zm-orange bg-zm-orange/15 px-2 py-0.5 rounded-full">
                        <FaFlag size={9} aria-hidden="true" /> {c.reports} báo cáo
                      </span>
                    )}
                    {c.hidden && (
                      <span className="text-[11px] font-semibold text-zm-muted bg-zm-muted/15 px-2 py-0.5 rounded-full">
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{c.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleHidden(c)}
                    aria-label={c.hidden ? `Hiện bình luận của ${c.author.name}` : `Ẩn bình luận của ${c.author.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-zm-blue-light hover:bg-zm-hover transition-colors"
                  >
                    {c.hidden ? <FaEye size={13} aria-hidden="true" /> : <FaEyeSlash size={13} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeComment(c)}
                    aria-label={`Xoá bình luận của ${c.author.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <FaTrash size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
            {!loading && !error && comments.length === 0 && (
              <div className="p-10 text-center text-zm-muted text-sm">
                Không có bình luận nào bị báo cáo.
              </div>
            )}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
