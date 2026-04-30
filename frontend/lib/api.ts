const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000/api";

const ACCESS_KEY = "srm.access";
const REFRESH_KEY = "srm.refresh";

export const tokens = {
  get access() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

async function refreshAccess(): Promise<string | null> {
  const r = tokens.refresh;
  if (!r) return null;
  const res = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: r }),
  });
  if (!res.ok) {
    tokens.clear();
    return null;
  }
  const data = await res.json();
  tokens.set(data.access, data.refresh);
  return data.access as string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  raw?: boolean;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, raw = false, headers: extraHeaders, ...rest } = opts;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extraHeaders as Record<string, string> | undefined),
  };

  let init: RequestInit = { ...rest, headers };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
  }

  if (auth) {
    const a = tokens.access;
    if (a) headers.Authorization = `Bearer ${a}`;
  }

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  let res = await fetch(url, init);

  if (res.status === 401 && auth) {
    const newAccess = await refreshAccess();
    if (newAccess) {
      headers.Authorization = `Bearer ${newAccess}`;
      res = await fetch(url, init);
    }
  }

  if (raw) return res as unknown as T;

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, `API ${res.status}`, data);
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export async function login(email: string, password: string) {
  const data = await api<{ access: string; refresh: string; user: unknown }>(
    "/auth/login/",
    { method: "POST", body: { email, password }, auth: false }
  );
  tokens.set(data.access, data.refresh);
  return data;
}

export async function logout() {
  const refresh = tokens.refresh;
  try {
    await api("/auth/logout/", { method: "POST", body: { refresh } });
  } catch {
    /* ignore */
  }
  tokens.clear();
}
