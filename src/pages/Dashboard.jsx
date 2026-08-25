import { useEffect, useState } from "react";
import { FaUsers, FaFileAlt, FaComments, FaExclamationTriangle, FaArrowUp } from "react-icons/fa";
import * as adminApi from "../api/admin";
import AdminHeader from "../components/layout/AdminHeader";
import Avatar from "../components/common/Avatar";
import ErrorBanner from "../components/common/ErrorBanner";
import { formatDate } from "../utils/time";

const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getStats(),
      adminApi.listUsers("", 0, 5),
      adminApi.listPosts("all", 0, 4),
    ])
      .then(([statsRes, usersRes, postsRes]) => {
        setStats(statsRes);
        setRecentUsers(usersRes.content);
        setRecentPosts(postsRes.content);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [reloadTick]);

  if (loading) {
    return (
      <>
        <AdminHeader title="Tổng quan" />
        <div className="p-6 text-sm text-zm-muted">Đang tải...</div>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <AdminHeader title="Tổng quan" />
        <div className="p-4 sm:p-6">
          <ErrorBanner
            message="Không thể tải dữ liệu tổng quan. Vui lòng thử lại."
            onRetry={() => setReloadTick((t) => t + 1)}
          />
        </div>
      </>
    );
  }

  const cards = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString("vi-VN"),
      delta: `+${stats.newUsersThisWeek} tuần này`,
      icon: FaUsers,
    },
    {
      label: "Tổng bài viết",
      value: stats.totalPosts.toLocaleString("vi-VN"),
      delta: `+${stats.postsToday} hôm nay`,
      icon: FaFileAlt,
    },
    {
      label: "Tin nhắn diễn đàn",
      value: stats.totalForumMessages.toLocaleString("vi-VN"),
      delta: "Đang hoạt động",
      icon: FaComments,
    },
    {
      label: "Báo cáo chờ xử lý",
      value: stats.reportsPending,
      delta: "Cần kiểm duyệt",
      icon: FaExclamationTriangle,
      warn: true,
    },
  ];

  const maxGrowth = Math.max(1, ...stats.userGrowth);

  return (
    <>
      <AdminHeader title="Tổng quan" />
      <div className="p-4 sm:p-6 flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(({ label, value, delta, icon: Icon, warn }) => (
            <div key={label} className="bg-zm-card rounded-2xl border border-zm-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    warn ? "bg-gradient-to-br from-zm-orange to-red-500" : "bg-gradient-to-br from-zm-blue to-zm-blue-light"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                </div>
              </div>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-xs text-zm-muted mt-0.5">{label}</p>
              <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${warn ? "text-zm-orange" : "text-emerald-400"}`}>
                {!warn && <FaArrowUp size={9} aria-hidden="true" />} {delta}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="bg-zm-card rounded-2xl border border-zm-border p-5">
            <h2 className="font-bold text-sm text-zm-muted uppercase tracking-wide mb-4">
              Tăng trưởng người dùng theo tháng
            </h2>
            <div className="flex items-end gap-2 h-40">
              {stats.userGrowth.map((v, i) => {
                const monthIdx = (new Date().getMonth() - (11 - i) + 12) % 12;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div
                      style={{ height: `${(v / maxGrowth) * 100}%` }}
                      className="w-full rounded-t-md bg-gradient-to-t from-zm-blue to-zm-blue-light group-hover:opacity-80 transition-opacity min-h-[4px]"
                      title={`${v} người dùng mới`}
                    />
                    <span className="text-[10px] text-zm-muted">{months[monthIdx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zm-card rounded-2xl border border-zm-border p-5">
            <h2 className="font-bold text-sm text-zm-muted uppercase tracking-wide mb-3">
              Người dùng mới
            </h2>
            <div className="flex flex-col gap-2.5">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2.5">
                  <Avatar src={u.avatar} name={u.name} alt="" className="w-8 h-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-zm-muted truncate">{formatDate(u.joined)}</p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-xs text-zm-muted">Chưa có người dùng nào.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-zm-card rounded-2xl border border-zm-border p-5">
          <h2 className="font-bold text-sm text-zm-muted uppercase tracking-wide mb-3">
            Bài viết gần đây
          </h2>
          <div className="flex flex-col divide-y divide-zm-border">
            {recentPosts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <Avatar src={p.author.avatar} name={p.author.name} alt="" className="w-8 h-8 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    <span className="font-semibold">{p.author.name}: </span>
                    {p.content}
                  </p>
                  <p className="text-xs text-zm-muted">{formatDate(p.createdAt)}</p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                    p.hidden
                      ? "bg-zm-muted/15 text-zm-muted"
                      : p.reports > 0
                        ? "bg-zm-orange/15 text-zm-orange"
                        : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {p.hidden ? "Đã ẩn" : p.reports > 0 ? "Bị báo cáo" : "Hiển thị"}
                </span>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <p className="text-xs text-zm-muted py-2.5">Chưa có bài viết nào.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
