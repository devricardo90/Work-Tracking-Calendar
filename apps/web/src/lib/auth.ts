import { API_BASE_URL, ApiError } from "./api";

type AuthResponse = {
  token?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

async function authRequest(path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Authentication failed";

    try {
      const data = (await response.json()) as { message?: string };
      message = data.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(response.status, message);
  }

  return (await response.json()) as AuthResponse;
}

export async function signInWithEmail(email: string, password: string) {
  return authRequest("/sign-in/email", {
    email,
    password,
  });
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  return authRequest("/sign-up/email", {
    name,
    email,
    password,
  });
}

export function getGoogleSignInUrl() {
  const callbackURL = encodeURIComponent("http://localhost:3000/calendar");
  return `${API_BASE_URL}/api/auth/sign-in/social?provider=google&callbackURL=${callbackURL}`;
}
