import type { ReactNode } from "react";

import { requireServerSession } from "@/lib/server-auth";

type CalendarLayoutProps = {
  children: ReactNode;
};

export default async function CalendarLayout({ children }: CalendarLayoutProps) {
  await requireServerSession();

  return children;
}
