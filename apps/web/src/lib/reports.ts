import { apiRequest } from "./api";

export async function sendMonthlyReportByEmail(month: string, email: string) {
  return apiRequest<{ success: boolean; email: string }>("/reports/monthly/email", {
    method: "POST",
    body: JSON.stringify({
      month,
      email,
    }),
  });
}
