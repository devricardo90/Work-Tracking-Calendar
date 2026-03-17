import type { ReactNode } from "react";

import { requireServerSession } from "@/lib/server-auth";

type SummaryLayoutProps = {
  children: ReactNode;
};

export default async function SummaryLayout({ children }: SummaryLayoutProps) {
  await requireServerSession();

  return children;
}
