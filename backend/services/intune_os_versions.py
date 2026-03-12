import httpx
import logging
from typing import Dict, List, Any, TypedDict
from services.graph_client import get_graph_headers, is_configured

logger = logging.getLogger(__name__)


def _windows_version(os_version: str | None) -> str:
    if not os_version:
        return "Windows"
    version = os_version.strip()
    parts = version.split('.')
    build = 0
    if len(parts) > 2:
        try:
            build = int(parts[2])
        except ValueError:
            pass
    elif len(parts) > 1:
        try:
            build = int(parts[1])
        except ValueError:
            pass

    if build >= 22000:
        return "Windows 11"
    return "Windows 10"


def _normalize_version(os_name: str, os_version: str | None) -> str:
    if not os_version:
        return os_name
    cleaned = os_version.strip()
    base = cleaned.split(' ')[0]
    base = base.split('(')[0]
    base = base.strip()
    import re
    match = re.match(r"^(\d+(?:\.\d+)+)", base)
    if match:
        base = match.group(1)
    if os_name == "Windows":
        return _windows_version(base)
    if os_name in ("macOS", "iOS"):
        parts = base.split('.')
        return '.'.join(parts[:2]) if len(parts) >= 2 else base
    return base


async def get_os_version_stats():
    if not is_configured():
        return {
            "osVersions": [
                {"os": "Windows", "total": 200, "versions": [
                    {"version": "Windows 11", "count": 120},
                    {"version": "Windows 10", "count": 80}
                ]},
                {"os": "macOS", "total": 45, "versions": [
                    {"version": "13.5", "count": 30},
                    {"version": "14.0", "count": 12}
                ]},
                {"os": "iOS", "total": 25, "versions": [
                    {"version": "17.3", "count": 18},
                    {"version": "17.4", "count": 7}
                ]}
            ],
            "total_devices": 270
        }

    headers = get_graph_headers()
    url = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=operatingSystem,osVersion&$top=999"
    version_counts: Dict[str, Dict[str, int]] = {}
    total = 0

    async with httpx.AsyncClient() as client:
        while url:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                logger.warning("Intune os versions failed %s %s", response.status_code, response.text)
                return {"error": "Failed to fetch managed devices", "details": response.text}
            payload = response.json()
            devices = payload.get("value", [])
            for device in devices:
                raw_os = device.get("operatingSystem") or device.get("os") or "Unknown"
                normalized_os = raw_os if raw_os in ("Windows", "macOS", "iOS") else raw_os.split()[0]
                version_label = _normalize_version(normalized_os, device.get("osVersion"))
                os_dict = version_counts.setdefault(normalized_os, {})
                os_dict[version_label] = os_dict.get(version_label, 0) + 1
                total += 1
            url = payload.get("@odata.nextLink")

    class OsVersion(TypedDict):
        os: str
        total: int
        versions: List[Dict[str, Any]]

    os_versions: List[OsVersion] = []
    for os_name, versions in version_counts.items():
        version_list = []
        for version, count in versions.items():
            version_list.append({"version": version, "count": count})
        version_list.sort(key=lambda item: item["count"], reverse=True)
        version_total = sum(item["count"] for item in version_list)
        os_versions.append({"os": os_name, "total": version_total, "versions": version_list})

    os_versions.sort(key=lambda item: item["total"], reverse=True)
    return {"osVersions": os_versions, "total_devices": total}
