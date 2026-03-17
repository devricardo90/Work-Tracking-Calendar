import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/server-auth";

type LoginLayoutProps = {
  children: ReactNode;
};

export default async function LoginLayout({ children }: LoginLayoutProps) {
  const session = await getServerSession();

  if (session) {
    redirect("/calendar");
  }

  return children;
}
