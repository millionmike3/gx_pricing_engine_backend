# backend/jobs/matrix_job.py

import os
import json
import datetime
from services.matrix_service import MatrixService
from services.investor_pricing_sheet_parser import parse_investor_sheet

class MatrixJob:
    """
    Daily matrix ingestion job.
    - Loads matrix
    - Validates structure
    - Merges investor sheets (optional)
    - Saves final matrix
    """

    def __init__(self):
        self.matrix_service = MatrixService()
        self.investor_sheet_dir = "data/investor_sheets"
        self.log_path = os.getenv("MATRIX_JOB_LOG", "logs/matrix_job.log")

    # ----------------------------------------------------------------------
    # LOAD INVESTOR SHEETS
    # ----------------------------------------------------------------------
    def load_investor_sheets(self):
        investor_data = {}

        if not os.path.exists(self.investor_sheet_dir):
            return investor_data

        for file in os.listdir(self.investor_sheet_dir):
            if file.endswith(".csv"):
                path = os.path.join(self.investor_sheet_dir, file)
                rows = parse_investor_sheet(path)

                # Convert rows into overlay dict
                for row in rows:
                    investor = row["investor"]
                    investor_data.setdefault("investor_overlays", {})
                    investor_data["investor_overlays"][investor] = row["overlay"]

        return investor_data

    # ----------------------------------------------------------------------
    # RUN JOB
    # ----------------------------------------------------------------------
    def run(self):
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

        try:
            matrix = self.matrix_service.load()
            self.matrix_service.validate(matrix)

            investor_data = self.load_investor_sheets()
            if investor_data:
                matrix = self.matrix_service.merge_investor_sheet(matrix, investor_data)

            self.matrix_service.save(matrix)

            with open(self.log_path, "a") as f:
                f.write(f"{datetime.datetime.utcnow().isoformat()} - Matrix job OK\n")

        except Exception as e:
            with open(self.log_path, "a") as f:
                f.write(f"{datetime.datetime.utcnow().isoformat()} - Matrix job FAILED: {e}\n")


if __name__ == "__main__":
    MatrixJob().run()
