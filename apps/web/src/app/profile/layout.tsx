import type { ReactNode } from "react";

import { requireServerSession } from "@/lib/server-auth";

type ProfileLayoutProps = {
  children: ReactNode;
};

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  await requireServerSession();

  return children;
}
