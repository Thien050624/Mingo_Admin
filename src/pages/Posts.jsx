import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaTrash, FaFlag, FaThumbsUp, FaComment } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatRelativeTime } from "../utils/time";

const PAGE_SIZE = 10;

const filters = [
  { key: "all", label: "Tất cả" },
  { key: "visible", label: "Đang hiển thị" },
  { key: "hidden", label: "Đã ẩn" },
  { key: "reported", label: "Bị báo cáo" },
];

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listPosts(filter, page, PAGE_SIZE)
      .then((res) => {
        setPosts(res.content);
        setTotalPages(res.totalPages);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filter, page, reloadTick]);

  const changeFilter = (key) => {
    setFilter(key);
    setPage(0);
  };

  const toggleVisibility = async (p) => {
    try {
      const updated = await adminApi.setPostHidden(p.id, !p.hidden);
      setPosts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (err) {
      window.alert(err.message || "Không thể cập nhật bài viết");
    }
  };

  const removePost = async (p) => {
    if (!window.confirm(`Xoá vĩnh viễn bài viết của ${p.author.name}? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deletePost(p.id);
      setPosts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      window.alert(err.message || "Không thể xoá bài viết");
    }
  };

  return (
    <>
      <AdminHeader title="Bài viết" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-1 bg-zm-card border border-zm-border rounded-full p-1 w-fit overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => changeFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`px-4 min-h-11 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-gradient-to-r from-zm-blue to-zm-blue-light text-white"
                  : "text-zm-muted hover:text-zm-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <ErrorBanner onRetry={() => setReloadTick((t) => t + 1)} />}

        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-zm-card rounded-2xl border border-zm-border p-4">
              <div className="flex items-start gap-3">
                <Avatar src={p.author.avatar} name={p.author.name} alt="" className="w-10 h-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{p.author.name}</p>
                    <span className="text-xs text-zm-muted">{formatRelativeTime(p.createdAt)}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        p.hidden ? "bg-zm-muted/15 text-zm-muted" : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {p.hidden ? "Đã ẩn" : "Hiển thị"}
                    </span>
                    {p.reports > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-zm-orange">
                        <FaFlag size={9} aria-hidden="true" /> {p.reports} báo cáo
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1.5">{p.content}</p>
                  {p.image && (
                    <img src={p.image} alt="" className="w-full max-w-xs rounded-xl mt-2.5 border border-zm-border" />
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-zm-muted">
                    <span className="flex items-center gap-1.5">
                      <FaThumbsUp size={11} aria-hidden="true" /> {p.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaComment size={11} aria-hidden="true" /> {p.comments}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleVisibility(p)}
                    aria-label={p.hidden ? `Hiện bài viết của ${p.author.name}` : `Ẩn bài viết của ${p.author.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-zm-blue-light hover:bg-zm-hover transition-colors"
                  >
                    {p.hidden ? <FaEye size={13} aria-hidden="true" /> : <FaEyeSlash size={13} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removePost(p)}
                    aria-label={`Xoá bài viết của ${p.author.name}`}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <FaTrash size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && !error && posts.length === 0 && (
            <div className="bg-zm-card rounded-2xl border border-zm-border p-10 text-center text-zm-muted text-sm">
              Không có bài viết nào trong mục này.
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
