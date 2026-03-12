import httpx
import logging
from services.graph_client import get_graph_headers, is_configured

logger = logging.getLogger(__name__)


OS_KEYWORDS = {
    "Windows": ["Windows"],
    "iOS": ["iOS", "iPhone", "iPad"],
    "Android": ["Android"],
    "macOS": ["macOS", "OSX"],
    "Linux": ["Linux"]
}


def _normalize_os(os_value: str | None) -> str:
    if not os_value:
        return "Autres"
    label = os_value.strip()
    upper_label = label.upper()
    for canonical, terms in OS_KEYWORDS.items():
        for term in terms:
            if term.upper() in upper_label:
                return canonical
    return label


async def get_device_compliance():
    if not is_configured():
        return {
            "total_devices": 112,
            "os_breakdown": [
                {"os": "Windows", "compliant": 80, "non_compliant": 5, "total": 85, "percentage": 94.1},
                {"os": "Android", "compliant": 15, "non_compliant": 6, "total": 21, "percentage": 71.4},
                {"os": "iOS", "compliant": 5, "non_compliant": 1, "total": 6, "percentage": 83.3}
            ]
        }

    headers = get_graph_headers()
    devices = []
    url = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$select=operatingSystem,complianceState&$top=999"

    async with httpx.AsyncClient() as client:
        while url:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                error_text = response.text
                logger.warning("Intune managedDevices failed %s %s", response.status_code, error_text)
                return {"error": "Failed to fetch managed devices", "details": error_text}
            payload = response.json()
            devices.extend(payload.get("value", []))
            url = payload.get("@odata.nextLink")

    if not devices:
        return {"error": "Failed to fetch managed devices"}

    breakdown = {}
    for device in devices:
        os_name = _normalize_os(device.get("operatingSystem"))
        state = (device.get("complianceState") or "").lower()
        stats = breakdown.setdefault(os_name, {"compliant": 0, "non_compliant": 0})
        if state == "compliant":
            stats["compliant"] += 1
        else:
            stats["non_compliant"] += 1

    os_breakdown = []
    for os_name, stats in breakdown.items():
        total = stats["compliant"] + stats["non_compliant"]
        percent = round((stats["compliant"] / total) * 100, 1) if total else 0
        os_breakdown.append({
            "os": os_name,
            "compliant": stats["compliant"],
            "non_compliant": stats["non_compliant"],
            "total": total,
            "percentage": percent
        })

    os_breakdown.sort(key=lambda row: row["total"], reverse=True)

    return {
        "total_devices": len(devices),
        "os_breakdown": os_breakdown
    }
