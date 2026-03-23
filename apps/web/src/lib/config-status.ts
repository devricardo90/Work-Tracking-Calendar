import { apiRequest } from "./api";

export type AppConfigStatus = {
  auth: {
    emailPassword: boolean;
    google: boolean;
  };
  reports: {
    email: boolean;
  };
};

export async function getAppConfigStatus() {
  return apiRequest<AppConfigStatus>("/config/status");
}
