export type ApiContent = {
  settings: Record<string, string>;
  projects: Project[];
  services: Service[];
  awards: Award[];
  socialLinks: SocialLink[];
};

export type Project = {
  id: number;
  title: string;
  category: string;
  year: string;
  accentColor: string;
  imageUrl: string;
  sortOrder: number;
};

export type Service = { id: number; name: string; sortOrder: number };
export type Award = { id: number; name: string; sortOrder: number };
export type SocialLink = { id: number; label: string; url: string; sortOrder: number };

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err = (data && typeof data === "object" && "error" in data ? (data as { error: string }).error : `HTTP ${res.status}`) as string;
    throw new ApiError(res.status, err, data);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
