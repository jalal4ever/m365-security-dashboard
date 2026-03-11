#!/usr/bin/env python3
"""Script centralise pour executer les agents"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from security.agent import SecurityAgent
from architecture.agent import ArchitectureAgent
from dev.agent import DevAgent


def run_security_agent():
    print("\n[SECURITY] Running Security Agent...\n")
    agent = SecurityAgent()
    print(agent.generate_report())
    results = agent.run_all_checks()
    return len(results["failed"]) == 0


def run_architecture_agent():
    print("\n[ARCHITECTURE] Running Architecture Agent...\n")
    agent = ArchitectureAgent()
    print(agent.generate_report())
    results = agent.run_all_checks()
    return len(results["failed"]) == 0


def run_dev_agent():
    print("\n[DEV] Running Dev Agent...\n")
    agent = DevAgent()
    print(agent.generate_report())
    fixes = agent.get_fixes_list()
    return len(fixes) == 0


def run_all_agents():
    print("=" * 50)
    print("M365 SECURITY DASHBOARD - AGENT RUNNER")
    print("=" * 50)

    results = []
    results.append(("Security", run_security_agent()))
    results.append(("Architecture", run_architecture_agent()))
    results.append(("Dev", run_dev_agent()))

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)

    all_passed = True
    for name, passed in results:
        status = "[PASSED]" if passed else "[FAILED]"
        print(f"  {name}: {status}")
        if not passed:
            all_passed = False

    return all_passed


def main():
    parser = argparse.ArgumentParser(description="Run M365 Agents")
    parser.add_argument("--agent", choices=["security", "architecture", "dev", "all"], default="all")
    args = parser.parse_args()

    if args.agent == "security":
        success = run_security_agent()
    elif args.agent == "architecture":
        success = run_architecture_agent()
    elif args.agent == "dev":
        success = run_dev_agent()
    else:
        success = run_all_agents()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
