// backend/pricing/margins/marginProfile.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MarginProfileService {
  async getMarginProfile(profileName: string) {
    const profile = await prisma.marginProfile.findUnique({
      where: { name: profileName },
    });

    if (!profile) {
      throw new Error(`Margin profile '${profileName}' not found`);
    }

    return profile;
  }
}

export const marginProfileService = new MarginProfileService();
