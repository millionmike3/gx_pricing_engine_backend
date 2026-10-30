# backend/shared/borrower_rules.py

from typing import Dict, Any

def validate_borrower(params: Dict[str, Any]) -> Dict[str, Any]:
    issues = []

    if params.get("fico", 0) < 620:
        issues.append("Minimum FICO 620 required")

    if params.get("ltv", 0) > 80 and params.get("dscr", 0) < 1.0:
        issues.append("High LTV with DSCR < 1.0 not allowed")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
    }
