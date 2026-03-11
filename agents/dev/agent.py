from pathlib import Path
from typing import Dict, Any, List


class DevAgent:
    """Agent Dev - Developpement et corrections"""

    def __init__(self, config_path: str = "agents/config.yaml"):
        self.project_root = Path(__file__).parent.parent.parent

    def analyze_codebase(self) -> Dict[str, Any]:
        results = {"backend_issues": [], "frontend_issues": [], "suggestions": []}

        results = self._check_logging(results)
        results = self._check_typescript(results)

        return results

    def _check_logging(self, results: Dict) -> Dict:
        main_file = self.project_root / "backend" / "app" / "main.py"

        if main_file.exists():
            content = main_file.read_text()
            if "import logging" not in content:
                results["backend_issues"].append({
                    "file": str(main_file),
                    "issue": "No logging configured"
                })

        return results

    def _check_typescript(self, results: Dict) -> Dict:
        app_file = self.project_root / "frontend" / "src" / "App.tsx"

        if app_file.exists():
            content = app_file.read_text()
            if ": any" in content:
                results["frontend_issues"].append({
                    "file": str(app_file),
                    "issue": "Using 'any' type - needs proper interfaces"
                })

        return results

    def get_fixes_list(self) -> List[Dict]:
        analysis = self.analyze_codebase()
        fixes = []

        for issue in analysis["backend_issues"] + analysis["frontend_issues"]:
            fixes.append(issue)

        return fixes

    def generate_report(self) -> str:
        analysis = self.analyze_codebase()
        fixes = self.get_fixes_list()

        report = ["=" * 50, "DEV AGENT REPORT", "=" * 50, ""]

        if fixes:
            report.append(f"Found {len(fixes)} issues:")
            for i, fix in enumerate(fixes, 1):
                report.append(f"\n{i}. {fix.get('issue', 'Unknown')}")
                report.append(f"   File: {fix.get('file', 'N/A')}")
        else:
            report.append("[PASSED] No issues found")

        return "\n".join(report)
