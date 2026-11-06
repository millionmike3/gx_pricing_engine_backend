import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { LLPACalculator } from "./llpa.calculator";
import { LLPARequest } from "./llpa.types";

@Injectable()
export class LLPAService {
  private calculator: LLPACalculator;

  constructor() {
    const rulesPath = path.join(__dirname, "rules");

    const creditTiers = JSON.parse(
      fs.readFileSync(path.join(rulesPath, "credit_tiers.json"), "utf8")
    );

    const propertyAdjs = JSON.parse(
      fs.readFileSync(path.join(rulesPath, "property_adjustments.json"), "utf8")
    );

    const lendingAdjs = JSON.parse(
      fs.readFileSync(path.join(rulesPath, "lending_type_adjustments.json"), "utf8")
    );

    const marginProfiles = JSON.parse(
      fs.readFileSync(path.join(rulesPath, "margin_profiles.json"), "utf8")
    );

    const baseRates = JSON.parse(
      fs.readFileSync(path.join(rulesPath, "base_rates.json"), "utf8")
    );

    const overlays = JSON.parse(
      fs.readFileSync(path.join(rulesPath, "overlays.json"), "utf8")
    );

    this.calculator = new LLPACalculator(
      creditTiers,
      propertyAdjs,
      lendingAdjs,
      marginProfiles,
      baseRates,
      overlays
    );
  }

  compute(req: LLPARequest) {
    return this.calculator.computeLLPA(req);
  }
}
