import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanySettingsService {
  constructor(private prisma: PrismaService) {}

  async getCompanySettings(companyId: number) {
    return this.prisma.companySettings.findUnique({
      where: { companyId },
      include: {
        company: true,
      },
    });
  }

  async updateBlockedMenus(companyId: number, blockedMenus: string[]) {
    return this.prisma.companySettings.upsert({
      where: { companyId },
      update: { blockedMenus },
      create: { companyId, blockedMenus },
    });
  }

  async isMenuBlocked(companyId: number | null, menuPath: string): Promise<boolean> {
    if (!companyId) {
      return false;
    }

    const settings = await this.getCompanySettings(companyId);
    if (!settings) {
      return false;
    }

    return settings.blockedMenus.includes(menuPath);
  }
}