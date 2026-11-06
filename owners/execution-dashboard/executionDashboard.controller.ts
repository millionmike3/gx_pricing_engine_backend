import { Controller, Get } from "@nestjs/common";
import { ExecutionDashboardService } from "./executionDashboard.service";

@Controller("owners/execution")
export class ExecutionDashboardController {
  constructor(private readonly execution: ExecutionDashboardService) {}

  @Get("summary")
  async getSummary() {
    return this.execution.getSummary();
  }
}
