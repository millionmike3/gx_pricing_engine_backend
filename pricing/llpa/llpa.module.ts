import { Module } from "@nestjs/common";
import { LLPAService } from "./llpa.service";
import { LLPAController } from "./llpa.controller";

@Module({
  providers: [LLPAService],
  controllers: [LLPAController],
  exports: [LLPAService],
})
export class LLPAModule {}
