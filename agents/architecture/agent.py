import yaml
from pathlib import Path
from typing import Dict, Any


class ArchitectureAgent:
    """Agent Architecture - Validation structure et performance"""

    def __init__(self, config_path: str = "agents/config.yaml"):
        self.project_root = Path(__file__).parent.parent.parent

    def run_all_checks(self) -> Dict[str, Any]:
        results = {"passed": [], "failed": [], "warnings": []}

        results = self._check_structure(results)
        results = self._check_database_models(results)
        results = self._check_performance(results)

        return results

    def _check_structure(self, results: Dict) -> Dict:
        required_dirs = [
            "backend/app",
            "backend/services",
            "frontend/src/components",
            "docker"
        ]

        for dir_path in required_dirs:
            full_path = self.project_root / dir_path
            if full_path.exists():
                results["passed"].append({"check": f"structure.{dir_path}"})
            else:
                results["failed"].append({"check": "structure", "message": f"Missing: {dir_path}"})

        return results

    def _check_database_models(self, results: Dict) -> Dict:
        models_file = self.project_root / "backend" / "app" / "models.py"

        if not models_file.exists():
            results["failed"].append({"check": "database_models", "message": "models.py not found"})
            return results

        content = models_file.read_text()

        for model in ["SecurityScore", "AdminRole", "License", "UserMfa"]:
            if f"class {model}" in content:
                results["passed"].append({"check": f"database_models.{model.lower()}"})

        return results

    def _check_performance(self, results: Dict) -> Dict:
        mfa_file = self.project_root / "backend" / "services" / "mfa_audit.py"

        if mfa_file.exists():
            content = mfa_file.read_text()
            if "for user in users:" in content and "await client.get" in content:
                results["warnings"].append({
                    "check": "performance",
                    "message": "N+1 query - sequential API calls in loop"
                })

        return results

    def generate_report(self) -> str:
        results = self.run_all_checks()

        report = ["=" * 50, "ARCHITECTURE AGENT REPORT", "=" * 50, ""]

        if results["passed"]:
            report.append("[PASSED]:")
            for item in results["passed"]:
                report.append(f"  - {item['check']}")

        if results["warnings"]:
            report.append("\n[WARNINGS]:")
            for item in results["warnings"]:
                report.append(f"  - {item['check']}: {item['message']}")

        if results["failed"]:
            report.append("\n[FAILED]:")
            for item in results["failed"]:
                report.append(f"  - {item['check']}: {item['message']}")

        return "\n".join(report)
