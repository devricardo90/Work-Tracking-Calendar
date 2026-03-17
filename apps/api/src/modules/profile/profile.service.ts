import type { AppPrismaClient } from "../../lib/prisma.js";
import type { ProfilePayload } from "./profile.schemas.js";

export type ProfileResponse = {
  name: string;
  email: string;
  language: string;
  savedLocations: string[];
};

export async function getProfile(prisma: AppPrismaClient, userId: string): Promise<ProfileResponse> {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      savedLocations: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  return {
    name: user.name,
    email: user.email,
    language: user.language,
    savedLocations: user.savedLocations.map((location) => location.name),
  };
}

export async function updateProfile(
  prisma: AppPrismaClient,
  userId: string,
  payload: ProfilePayload,
): Promise<ProfileResponse> {
  const normalizedLocations = Array.from(
    new Set(payload.savedLocations.map((location) => location.trim()).filter(Boolean)),
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: payload.name,
      language: payload.language,
    },
  });

  await prisma.$transaction([
    prisma.savedLocation.deleteMany({
      where: {
        userId,
      },
    }),
    ...(normalizedLocations.length
      ? [
          prisma.savedLocation.createMany({
            data: normalizedLocations.map((name) => ({
              userId,
              name,
            })),
          }),
        ]
      : []),
  ]);

  return getProfile(prisma, userId);
}
