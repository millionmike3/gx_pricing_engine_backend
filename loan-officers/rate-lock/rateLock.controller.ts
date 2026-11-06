import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import { RateLockService } from "./rateLock.service";

@Controller("loan-officers/rate-lock")
export class RateLockController {
  constructor(private readonly lockService: RateLockService) {}

  @Post(":loanId")
  async lock(
    @Param("loanId") loanId: string,
    @Body("finalRate") finalRate: number,
  ) {
    return this.lockService.lockRate(loanId, finalRate);
  }

  @Get(":loanId")
  async get(@Param("loanId") loanId: string) {
    return this.lockService.getLock(loanId);
  }
}
