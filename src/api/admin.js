import { request, ApiError, ACCESS_TOKEN_KEY } from "./client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const token = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getMe = () => request("/users/me", { token: token() });

export const getStats = () => request("/admin/stats", { token: token() });

export const listUsers = (query = "", page = 0, size = 20) =>
  request(`/admin/users?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, { token: token() });

export const setUserBanned = (userId, banned) =>
  request(`/admin/users/${userId}/status`, { method: "PATCH", body: { banned }, token: token() });

export const deleteUser = (userId) =>
  request(`/admin/users/${userId}`, { method: "DELETE", token: token() });

export const listPosts = (filter = "all", page = 0, size = 20) =>
  request(`/admin/posts?filter=${filter}&page=${page}&size=${size}`, { token: token() });

export const setPostHidden = (postId, hidden) =>
  request(`/admin/posts/${postId}/hidden`, { method: "PATCH", body: { hidden }, token: token() });

export const deletePost = (postId) =>
  request(`/admin/posts/${postId}`, { method: "DELETE", token: token() });

export const listForumMessages = (page = 0, size = 30) =>
  request(`/admin/forum/messages?page=${page}&size=${size}`, { token: token() });

export const deleteForumMessage = (messageId) =>
  request(`/admin/forum/messages/${messageId}`, { method: "DELETE", token: token() });

export const clearForumMessages = () =>
  request(`/admin/forum/messages`, { method: "DELETE", token: token() });

export const setForumMessageHidden = (messageId, hidden) =>
  request(`/admin/forum/messages/${messageId}/hidden`, { method: "PATCH", body: { hidden }, token: token() });

export const listChatMessageReports = (page = 0, size = 30) =>
  request(`/admin/chat/messages?page=${page}&size=${size}`, { token: token() });

export const deleteChatMessage = (messageId) =>
  request(`/admin/chat/messages/${messageId}`, { method: "DELETE", token: token() });

export const listAuditLog = (page = 0, size = 30, filters = {}) => {
  const params = new URLSearchParams({ page, size });
  if (filters.adminId) params.set("adminId", filters.adminId);
  if (filters.action) params.set("action", filters.action);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return request(`/admin/audit-log?${params.toString()}`, { token: token() });
};

export const listAdmins = () => request("/admin/admins", { token: token() });

export const exportAuditLogCsv = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.adminId) params.set("adminId", filters.adminId);
  if (filters.action) params.set("action", filters.action);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const res = await fetch(`${API_BASE}/admin/audit-log/export?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) {
    throw new ApiError("Không thể xuất file CSV", res.status);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : "audit-log.csv";
  return { blob, filename };
};
