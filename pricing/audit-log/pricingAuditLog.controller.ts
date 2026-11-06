import { Controller, Get, Query } from "@nestjs/common";
import { PricingAuditLogService } from "./pricingAuditLog.service";

@Controller("pricing/audit-log")
export class PricingAuditLogController {
  constructor(private readonly audit: PricingAuditLogService) {}

  @Get("recent")
  async recent(@Query("limit") limit?: string) {
    return this.audit.getRecent(limit ? Number(limit) : 200);
  }

  @Get("module")
  async byModule(@Query("module") module: string) {
    return this.audit.getByModule(module);
  }

  @Get("actor")
  async byActor(@Query("actor_id") actor_id: string) {
    return this.audit.getByActor(actor_id);
  }
}
