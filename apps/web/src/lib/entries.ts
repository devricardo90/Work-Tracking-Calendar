import { format } from "date-fns";

import { apiRequest } from "./api";

export type Entry = {
  id: string;
  workDate: string;
  hoursWorked: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EntryPayload = {
  workDate: string;
  hoursWorked: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
};

export async function getEntriesByMonth(month: string) {
  return apiRequest<{ entries: Entry[] }>(`/entries?month=${month}`);
}

export async function getEntryByDate(workDate: string) {
  return apiRequest<{ entry: Entry }>(`/entries/${workDate}`);
}

export async function createEntry(payload: EntryPayload) {
  return apiRequest<{ entry: Entry }>("/entries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEntry(id: string, payload: EntryPayload) {
  return apiRequest<{ entry: Entry }>(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEntry(id: string) {
  return apiRequest<void>(`/entries/${id}`, {
    method: "DELETE",
  });
}

export function toMonthParam(date: Date) {
  return format(date, "yyyy-MM");
}

export function toDayParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}
