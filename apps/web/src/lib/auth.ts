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

  try {
    const data = (await response.json()) as { message?: string };
    message = data.message ?? message;
  } catch {
    message = response.statusText || message;
  }

  throw new ApiError(response.status, message);
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

  if (response.status === 204) {
    return undefined as T;
  };

  return (await response.json()) as T;
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
  return authPostRequest<SignOutResponse>("/sign-out");
}

export function getGoogleSignInUrl() {
  const callbackURL = encodeURIComponent("http://localhost:3000/calendar");
  return `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${callbackURL}`;
}
