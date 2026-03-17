import type { ReactNode } from "react";

import { requireServerSession } from "@/lib/server-auth";

type EntriesLayoutProps = {
  children: ReactNode;
};

export default async function EntriesLayout({ children }: EntriesLayoutProps) {
  await requireServerSession();

  return children;
}
