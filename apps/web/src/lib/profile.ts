import { apiRequest } from "./api";

export type Profile = {
  name: string;
  email: string;
  language: string;
  savedLocations: string[];
};

export async function getProfile() {
  return apiRequest<{ profile: Profile }>("/profile");
}

export async function updateProfile(payload: Profile) {
  return apiRequest<{ profile: Profile }>("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
