import { Module } from "@nestjs/common";
import { RevenueDashboardService } from "./revenueDashboard.service";
import { RevenueDashboardController } from "./revenueDashboard.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  providers: [RevenueDashboardService, PrismaService],
  controllers: [RevenueDashboardController],
  exports: [RevenueDashboardService],
})
export class RevenueDashboardModule {}
