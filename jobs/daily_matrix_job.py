# backend/jobs/daily_ingestion_job.py

import os
import json
from datetime import datetime
from shared.matrix_loader import load_matrix

LOG_PATH = os.getenv("INGEST_LOG", "logs/daily_ingestion.log")
MATRIX_PATH = os.getenv("MATRIX_FILE", "data/pricing_matrix.json")


def run_daily_ingestion():
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

    try:
        matrix = load_matrix(MATRIX_PATH)
        # Here you’d plug in external feeds, overlays, etc.
        # For now, we just log that ingestion ran successfully.
        with open(LOG_PATH, "a") as f:
            f.write(f"{datetime.utcnow().isoformat()} - Ingestion OK, matrix size: {len(matrix.get('fico', {}))}\n")
    except Exception as e:
        with open(LOG_PATH, "a") as f:
            f.write(f"{datetime.utcnow().isoformat()} - Ingestion FAILED: {e}\n")


if __name__ == "__main__":
    run_daily_ingestion()
