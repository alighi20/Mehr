const API_BASE_URL = "http://localhost:3001/api";
const TOKEN_STORAGE_KEY = "mehr_auth_token";
const USER_STORAGE_KEY = "mehr_auth_user";

function getDefaultHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...getDefaultHeaders(token),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.message || "درخواست با خطا مواجه شد.");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function getStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = localStorage.getItem(USER_STORAGE_KEY);

    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function saveAuthSession(token, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export async function checkServer() {
  return request("/health");
}

export async function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function loginUser(payload) {
  const data = await request("/auth/login", {
    method: "POST",
    body: payload,
  });

  if (data?.success && data.token && data.user) {
    saveAuthSession(data.token, data.user);
  }

  return data;
}

export async function requestPasswordReset(payload) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export async function submitCartOrder(payload) {
  return request("/orders", {
    method: "POST",
    body: payload,
  });
}

export async function getCurrentUser() {
  const { token } = getStoredAuth();

  if (!token) {
    return null;
  }

  const data = await request("/auth/me", { token });
  return data?.user ?? null;
}
