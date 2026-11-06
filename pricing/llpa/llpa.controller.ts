import { Controller, Post, Body } from "@nestjs/common";
import { LLPAService } from "./llpa.service";
import { LLPARequest } from "./llpa.types";

@Controller("pricing/llpa")
export class LLPAController {
  constructor(private readonly llpa: LLPAService) {}

  @Post("preview")
  preview(@Body() req: LLPARequest) {
    return this.llpa.compute(req);
  }
}
