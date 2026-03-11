import os
import subprocess
import yaml
from pathlib import Path
from typing import Dict, List, Any


class SecurityAgent:
    """Agent de securite - Audit vulnerabilites et configuration"""

    def __init__(self, config_path: str = "agents/config.yaml"):
        self.config = self._load_config(config_path)
        self.project_root = Path(__file__).parent.parent.parent
        self.issues = []

    def _load_config(self, config_path: str) -> Dict:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    def run_all_checks(self) -> Dict[str, Any]:
        checks = self.config.get('agents', {}).get('security', {}).get('checks', [])
        results = {"passed": [], "failed": [], "warnings": []}

        if "cors" in checks:
            results = self._check_cors(results)
        if "dependencies" in checks:
            results = self._check_dependencies(results)
        if "env_vars" in checks:
            results = self._check_env_vars(results)

        return results

    def _check_cors(self, results: Dict) -> Dict:
        cors_file = self.project_root / "backend" / "app" / "main.py"

        if not cors_file.exists():
            results["failed"].append({"check": "cors", "message": "main.py not found"})
            return results

        content = cors_file.read_text()

        if 'allow_origins=["*"]' in content or "allow_origins=['*']" in content:
            results["failed"].append({
                "check": "cors",
                "file": str(cors_file),
                "message": "CORS allows all origins - SECURITY RISK",
                "severity": "critical"
            })
        else:
            results["passed"].append({"check": "cors"})

        return results

    def _check_dependencies(self, results: Dict) -> Dict:
        backend_req = self.project_root / "backend" / "requirements.txt"

        if backend_req.exists():
            results["passed"].append({"check": "dependencies"})

        return results

    def _check_env_vars(self, results: Dict) -> Dict:
        required = self.config.get('security', {}).get('required_env_vars', [])
        env_file = self.project_root / ".env"

        if not env_file.exists():
            results["warnings"].append({
                "check": "env_vars",
                "message": ".env file missing - create from .env.example"
            })
            return results

        content = env_file.read_text()
        missing = [var for var in required if var not in content]

        if missing:
            results["failed"].append({
                "check": "env_vars",
                "message": f"Missing required vars: {', '.join(missing)}"
            })
        else:
            results["passed"].append({"check": "env_vars"})

        return results

    def generate_report(self) -> str:
        results = self.run_all_checks()

        report = ["=" * 50, "SECURITY AGENT REPORT", "=" * 50, ""]

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
