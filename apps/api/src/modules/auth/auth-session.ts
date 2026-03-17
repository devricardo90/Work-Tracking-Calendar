import type { FastifyRequest } from "fastify";

import { auth } from "../../../auth.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

export class AuthenticationError extends Error {}

function createRequestHeaders(request: FastifyRequest): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    }
  }

  return headers;
}

export async function requireAuthenticatedUser(
  request: FastifyRequest,
): Promise<AuthenticatedUser> {
  const session = await auth.api.getSession({
    headers: createRequestHeaders(request),
  });

  if (!session?.user) {
    throw new AuthenticationError("Authentication required");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
