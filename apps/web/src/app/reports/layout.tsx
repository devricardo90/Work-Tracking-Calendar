import type { ReactNode } from "react";

import { requireServerSession } from "@/lib/server-auth";

type ReportsLayoutProps = {
  children: ReactNode;
};

export default async function ReportsLayout({ children }: ReportsLayoutProps) {
  await requireServerSession();

  return children;
}
