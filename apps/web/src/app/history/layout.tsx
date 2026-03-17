import type { ReactNode } from "react";

import { requireServerSession } from "@/lib/server-auth";

type HistoryLayoutProps = {
  children: ReactNode;
};

export default async function HistoryLayout({ children }: HistoryLayoutProps) {
  await requireServerSession();

  return children;
}
