import { Prisma } from "@prisma/client";

import { formatDayString, getMonthRange, parseDayString } from "../../lib/dates.js";
import type { AppPrismaClient } from "../../lib/prisma.js";
import type { EntryPayload } from "./entry.schemas.js";

export type EntryResponse = {
  id: string;
  workDate: string;
  hoursWorked: number;
  location: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export class EntryConflictError extends Error {}
export class EntryNotFoundError extends Error {}

function toEntryResponse(entry: {
  id: string;
  workDate: Date;
  hoursWorked: Prisma.Decimal;
  location: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): EntryResponse {
  return {
    id: entry.id,
    workDate: formatDayString(entry.workDate),
    hoursWorked: Number(entry.hoursWorked),
    location: entry.location,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export async function listEntriesByMonth(prisma: AppPrismaClient, userId: string, month: string) {
  const range = getMonthRange(month);

  const entries = await prisma.workEntry.findMany({
    where: {
      userId,
      workDate: {
        gte: range.start,
        lt: range.end,
      },
    },
    orderBy: {
      workDate: "asc",
    },
  });

  return entries.map(toEntryResponse);
}

export async function getEntryByDate(prisma: AppPrismaClient, userId: string, workDate: string) {
  const parsedDate = parseDayString(workDate);

  const entry = await prisma.workEntry.findUnique({
    where: {
      userId_workDate: {
        userId,
        workDate: parsedDate,
      },
    },
  });

  return entry ? toEntryResponse(entry) : null;
}

export async function createEntry(prisma: AppPrismaClient, userId: string, payload: EntryPayload) {
  try {
    const entry = await prisma.workEntry.create({
      data: {
        userId,
        workDate: parseDayString(payload.workDate),
        hoursWorked: new Prisma.Decimal(payload.hoursWorked),
        location: payload.location,
        notes: payload.notes?.trim() ? payload.notes.trim() : null,
      },
    });

    return toEntryResponse(entry);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new EntryConflictError("An entry already exists for this date");
    }

    throw error;
  }
}

export async function updateEntry(
  prisma: AppPrismaClient,
  userId: string,
  id: string,
  payload: EntryPayload,
) {
  const existingEntry = await prisma.workEntry.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existingEntry) {
    throw new EntryNotFoundError("Entry not found");
  }

  try {
    const entry = await prisma.workEntry.update({
      where: {
        id: existingEntry.id,
      },
      data: {
        workDate: parseDayString(payload.workDate),
        hoursWorked: new Prisma.Decimal(payload.hoursWorked),
        location: payload.location,
        notes: payload.notes?.trim() ? payload.notes.trim() : null,
      },
    });

    return toEntryResponse(entry);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new EntryConflictError("An entry already exists for this date");
    }

    throw error;
  }
}

export async function deleteEntry(prisma: AppPrismaClient, userId: string, id: string) {
  const existingEntry = await prisma.workEntry.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existingEntry) {
    throw new EntryNotFoundError("Entry not found");
  }

  await prisma.workEntry.delete({
    where: {
      id: existingEntry.id,
    },
  });
}
