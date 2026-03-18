export class ReportRateLimitError extends Error {}

type ReportRateLimitEntry = {
  count: number;
  resetAt: number;
};

const reportRateLimitStore = new Map<string, ReportRateLimitEntry>();

const REPORT_RATE_LIMIT_WINDOW_MS = 60_000;
const REPORT_PDF_MAX_REQUESTS = 10;
const REPORT_EMAIL_MAX_REQUESTS = 3;

function getLimitForAction(action: "pdf" | "email") {
  return action === "email" ? REPORT_EMAIL_MAX_REQUESTS : REPORT_PDF_MAX_REQUESTS;
}

export function enforceReportRateLimit(userId: string, action: "pdf" | "email") {
  const now = Date.now();
  const key = `${userId}:${action}`;
  const limit = getLimitForAction(action);
  const current = reportRateLimitStore.get(key);

  if (!current || now >= current.resetAt) {
    reportRateLimitStore.set(key, {
      count: 1,
      resetAt: now + REPORT_RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (current.count >= limit) {
    throw new ReportRateLimitError("Too many report requests. Please try again later.");
  }

  reportRateLimitStore.set(key, {
    ...current,
    count: current.count + 1,
  });
}
