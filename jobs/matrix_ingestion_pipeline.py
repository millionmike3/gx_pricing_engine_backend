# backend/jobs/matrix_ingestion_pipeline.py

import os
import json
import datetime
from services.matrix_service import MatrixService
from services.matrix_validator import MatrixValidator
from services.investor_pricing_sheet_parser import parse_investor_sheet

class MatrixIngestionPipeline:
    def __init__(self):
        self.matrix_service = MatrixService()
        self.validator = MatrixValidator()
        self.investor_sheet_dir = "data/investor_sheets"
        self.log_path = os.getenv("MATRIX_PIPELINE_LOG", "logs/matrix_pipeline.log")

    def load_investor_overlays(self):
        overlays = {}
        if not os.path.exists(self.investor_sheet_dir):
            return overlays

        for file in os.listdir(self.investor_sheet_dir):
            if file.endswith(".csv"):
                path = os.path.join(self.investor_sheet_dir, file)
                data = parse_investor_sheet(path)
                overlays.update(data.get("investor_overlays", {}))

        return overlays

    def run(self):
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

        try:
            matrix = self.matrix_service.load()
            self.validator.validate(matrix)

            overlays = self.load_investor_overlays()
            if overlays:
                matrix["investor_overlays"].update(overlays)

            self.validator.validate(matrix)
            self.matrix_service.save(matrix)

            with open(self.log_path, "a") as f:
                f.write(f"{datetime.datetime.utcnow().isoformat()} - Matrix pipeline OK\n")
        except Exception as e:
            with open(self.log_path, "a") as f:
                f.write(f"{datetime.datetime.utcnow().isoformat()} - Matrix pipeline FAILED: {e}\n")


if __name__ == "__main__":
    MatrixIngestionPipeline().run()
