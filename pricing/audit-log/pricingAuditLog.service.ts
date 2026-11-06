import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAuditEventInput, PricingAuditEvent } from "./pricingAuditLog.types";

@Injectable()
export class PricingAuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(input: CreateAuditEventInput): Promise<PricingAuditEvent> {
    return this.prisma.pricingAuditLog.create({
      data: {
        actor_role: input.actor_role,
        actor_id: input.actor_id,
        action: input.action,
        module: input.module,
        details: input.details,
      },
    });
  }

  async getRecent(limit = 200): Promise<PricingAuditEvent[]> {
    return this.prisma.pricingAuditLog.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
    });
  }

  async getByModule(module: string): Promise<PricingAuditEvent[]> {
    return this.prisma.pricingAuditLog.findMany({
      where: { module },
      orderBy: { created_at: "desc" },
    });
  }

  async getByActor(actor_id: string): Promise<PricingAuditEvent[]> {
    return this.prisma.pricingAuditLog.findMany({
      where: { actor_id },
      orderBy: { created_at: "desc" },
    });
  }
}
