import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_BASE_URL } from "./api";
import type { AuthSession } from "./auth";

async function readSessionFromApi(cookieHeader: string): Promise<AuthSession | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthSession | null;
}

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  return readSessionFromApi(cookieHeader);
}

export async function requireServerSession(): Promise<AuthSession> {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
