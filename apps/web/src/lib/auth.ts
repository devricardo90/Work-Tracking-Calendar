import { API_BASE_URL, ApiError } from "./api";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: boolean;
};

type AuthSessionData = {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuthSession = {
  session: AuthSessionData;
  user: AuthUser;
};

type AuthResponse = {
  token?: string | null;
  user?: AuthUser;
};

type SignOutResponse = {
  success?: boolean;
};

async function parseApiError(response: Response, fallbackMessage: string) {
  let message = fallbackMessage;
  let code: string | undefined;
  let issues:
    | {
        path: string;
        message: string;
      }[]
    | undefined;

  try {
    const data = (await response.json()) as { message?: string; code?: string; issues?: { path: string; message: string }[] };
    message = data.message ?? message;
    code = data.code;
    issues = data.issues;
  } catch {
    message = response.statusText || message;
  }

  throw new ApiError(response.status, message, { code, issues });
}

async function authGetRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/auth${path}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    await parseApiError(response, "Authentication request failed");
  }

  return (await response.json()) as T;
}

async function parseAuthSuccessPayload<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return undefined as T;
  }

  return JSON.parse(rawBody) as T;
}

async function authPostRequest<T>(path: string, payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/auth${path}`, {
    method: "POST",
    headers: payload
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
    credentials: "include",
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    await parseApiError(response, "Authentication failed");
  }

  return parseAuthSuccessPayload<T>(response);
}

export async function signInWithEmail(email: string, password: string) {
  return authPostRequest<AuthResponse>("/sign-in/email", {
    email,
    password,
  });
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  return authPostRequest<AuthResponse>("/sign-up/email", {
    name,
    email,
    password,
  });
}

export async function getCurrentSession() {
  return authGetRequest<AuthSession | null>("/get-session");
}

export async function signOut() {
  return authPostRequest<SignOutResponse>("/sign-out", {});
}

export function getGoogleSignInUrl() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const callbackURL = encodeURIComponent(`${appUrl}/calendar`);
  return `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${callbackURL}`;
}
