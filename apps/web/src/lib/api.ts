const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ApiIssue = {
  path: string;
  message: string;
};

type ApiErrorPayload = {
  message?: string;
  code?: string;
  issues?: ApiIssue[];
};

export class ApiError extends Error {
  status: number;
  code?: string;
  issues?: ApiIssue[];

  constructor(status: number, message: string, options?: { code?: string; issues?: ApiIssue[] }) {
    super(message);
    this.status = status;
    this.code = options?.code;
    this.issues = options?.issues;
  }
}

export function isAuthenticationError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Request failed";
    let code: string | undefined;
    let issues: ApiIssue[] | undefined;

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.message ?? message;
      code = payload.code;
      issues = payload.issues;
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(response.status, message, { code, issues });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };
