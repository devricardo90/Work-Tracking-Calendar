import { getMonthRange } from "../../lib/dates.js";
import { getMailer, getMailerFromAddress } from "../../lib/mailer.js";
import { createPdfDocument } from "../../lib/pdf.js";
import type { AppPrismaClient } from "../../lib/prisma.js";
import type { MonthlyReportEmailPayload } from "./report.schemas.js";

type ReportEntry = {
  workDate: Date;
  hoursWorked: string;
  location: string;
  notes: string | null;
};

type MonthlyPdfReport = {
  fileName: string;
  pdf: Buffer;
};

type MonthlyEmailReport = {
  recipientEmail: string;
  fileName: string;
  pdf: Buffer;
  workerName: string;
  monthLabel: string;
};

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
}

function formatDayLabel(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildPages(userName: string, month: string, entries: ReportEntry[]) {
  const monthLabel = formatMonthLabel(month);
  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hoursWorked), 0);
  const workedDays = entries.length;
  const dailyAverage = workedDays ? totalHours / workedDays : 0;
  const baseLines = [
    "50 790 Td (Worker Hours Tracker - Monthly Report) Tj",
    "0 -22 Td (Worker: " + userName.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ") Tj",
    "0 -18 Td (Period: " + monthLabel.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ") Tj",
    "0 -18 Td (Total Hours: " + totalHours.toFixed(1) + ") Tj",
    "0 -18 Td (Worked Days: " + String(workedDays) + " | Daily Avg: " + dailyAverage.toFixed(1) + ") Tj",
    "0 -28 Td (Date        Location                              Hours  Notes) Tj",
  ];

  const pages: string[][] = [];
  let currentPage = [...baseLines];
  let linesOnPage = 0;

  const pushEntryLine = (text: string) => {
    if (linesOnPage >= 42) {
      pages.push(currentPage);
      currentPage = [
        "50 790 Td (Worker Hours Tracker - Monthly Report) Tj",
        "0 -22 Td (Continued - " + monthLabel.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ") Tj",
        "0 -28 Td (Date        Location                              Hours  Notes) Tj",
      ];
      linesOnPage = 0;
    }

    currentPage.push(`0 -14 Td (${text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")}) Tj`);
    linesOnPage += 1;
  };

  if (!entries.length) {
    pushEntryLine("No entries found for this month.");
  } else {
    for (const entry of entries) {
      const location = entry.location.length > 34 ? `${entry.location.slice(0, 31)}...` : entry.location;
      const notes = entry.notes
        ? entry.notes.length > 30
          ? `${entry.notes.slice(0, 27)}...`
          : entry.notes
        : "-";
      pushEntryLine(
        `${formatDayLabel(entry.workDate)}  ${location.padEnd(34, " ")}  ${Number(entry.hoursWorked)
          .toFixed(1)
          .padStart(5, " ")}  ${notes}`,
      );
    }
  }

  pages.push(currentPage);
  return pages;
}

export async function generateMonthlyPdfReport(
  prisma: AppPrismaClient,
  userId: string,
  month: string,
): Promise<MonthlyPdfReport> {
  getMonthRange(month);

  const [user, entries] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    }),
    prisma.workEntry.findMany({
      where: {
        userId,
        workDate: {
          gte: getMonthRange(month).start,
          lt: getMonthRange(month).end,
        },
      },
      orderBy: {
        workDate: "asc",
      },
      select: {
        workDate: true,
        hoursWorked: true,
        location: true,
        notes: true,
      },
    }),
  ]);

  const pages = buildPages(
    user.name,
    month,
    entries.map((entry) => ({
      workDate: entry.workDate,
      hoursWorked: entry.hoursWorked.toString(),
      location: entry.location,
      notes: entry.notes,
    })),
  );

  return {
    fileName: `worker-hours-${month}.pdf`,
    pdf: createPdfDocument(pages),
  };
}

async function generateMonthlyEmailReport(
  prisma: AppPrismaClient,
  userId: string,
  payload: MonthlyReportEmailPayload,
): Promise<MonthlyEmailReport> {
  getMonthRange(payload.month);

  const [user, entries] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    }),
    prisma.workEntry.findMany({
      where: {
        userId,
        workDate: {
          gte: getMonthRange(payload.month).start,
          lt: getMonthRange(payload.month).end,
        },
      },
      orderBy: {
        workDate: "asc",
      },
      select: {
        workDate: true,
        hoursWorked: true,
        location: true,
        notes: true,
      },
    }),
  ]);

  const pages = buildPages(
    user.name,
    payload.month,
    entries.map((entry) => ({
      workDate: entry.workDate,
      hoursWorked: entry.hoursWorked.toString(),
      location: entry.location,
      notes: entry.notes,
    })),
  );

  return {
    recipientEmail: payload.email,
    fileName: `worker-hours-${payload.month}.pdf`,
    pdf: createPdfDocument(pages),
    workerName: user.name,
    monthLabel: formatMonthLabel(payload.month),
  };
}

export async function sendMonthlyPdfReportByEmail(
  prisma: AppPrismaClient,
  userId: string,
  payload: MonthlyReportEmailPayload,
) {
  const report = await generateMonthlyEmailReport(prisma, userId, payload);
  const transporter = getMailer();
  const from = getMailerFromAddress();

  await transporter.sendMail({
    from,
    to: report.recipientEmail,
    subject: `Worker Hours Report - ${report.monthLabel}`,
    text: [
      `Hello,`,
      ``,
      `Attached is the monthly worker hours report for ${report.workerName}.`,
      `Period: ${report.monthLabel}`,
      ``,
      `This email was generated by Worker Hours Tracker.`,
    ].join("\n"),
    attachments: [
      {
        filename: report.fileName,
        content: report.pdf,
        contentType: "application/pdf",
      },
    ],
  });

  return {
    success: true,
    email: report.recipientEmail,
  };
}
