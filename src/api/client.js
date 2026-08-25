const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const ACCESS_TOKEN_KEY = "mingo-admin-access-token";
export const REFRESH_TOKEN_KEY = "mingo-admin-refresh-token";

export const SESSION_EXPIRED_EVENT = "mingo-admin:session-expired";

const AUTH_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh"]);

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function rawFetch(path, { method, body, token }) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  return { res, data };
}

let refreshPromise = null;

export function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!storedRefreshToken) return Promise.resolve(null);

  refreshPromise = rawFetch("/auth/refresh", { method: "POST", body: { refreshToken: storedRefreshToken } })
    .then(({ res, data }) => {
      if (!res.ok) throw new Error("refresh failed");
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      return data.accessToken;
    })
    .catch(() => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function isAuthFailure(status) {
  return status === 401 || status === 403;
}

export async function request(path, { method = "GET", body, token } = {}) {
  let { res, data } = await rawFetch(path, { method, body, token });

  if (isAuthFailure(res.status) && token && !AUTH_PATHS.has(path)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      ({ res, data } = await rawFetch(path, { method, body, token: newToken }));
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.message || "Đã có lỗi xảy ra, vui lòng thử lại sau", res.status, data?.fieldErrors);
  }
  return data;
}
