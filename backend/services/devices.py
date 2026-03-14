import httpx
from services.graph_client import get_graph_headers
from collections import defaultdict


def parse_version(version: str, os_name: str) -> str:
    if not version or version == "Unknown" or not os_name:
        return "Unknown"
    
    version = version.strip()
    
    if "(" in version:
        version = version.split("(")[0].strip()
    
    if os_name == "Windows":
        try:
            parts = version.split(".")
            if len(parts) >= 3:
                build = int(parts[2]) if parts[2].isdigit() else 0
                
                if build >= 22000:
                    return "11"
                else:
                    return "10"
            elif len(parts) >= 2:
                build = int(parts[1]) if parts[1].isdigit() else 0
                if build >= 22000:
                    return "11"
                else:
                    return "10"
        except:
            pass
        return "Unknown"
    
    if os_name == "macOS":
        parts = version.split(".")
        if len(parts) >= 2:
            try:
                major = int(parts[0])
                minor = parts[1]
                if major >= 11:
                    return f"{major}.{minor}"
                elif major == 10:
                    return "10.15"
            except:
                pass
        return version
    
    if os_name == "iOS":
        parts = version.split(".")
        if len(parts) >= 2:
            return f"{parts[0]}.{parts[1]}"
        elif len(parts) == 1 and parts[0].isdigit():
            return f"{parts[0]}.0"
        return "Unknown"
    
    if os_name == "Android":
        parts = version.split(".")
        if len(parts) >= 1:
            return parts[0]
        return "Unknown"
    
    return "Unknown"


def normalize_os_name(os_name: str) -> str:
    if not os_name:
        return "Unknown"
    
    os_name = os_name.strip()
    
    if os_name.lower() in ["macmdm", "mac"]:
        return "macOS"
    
    if os_name.lower() in ["iphone", "ipad"]:
        return "iOS"
    
    if os_name == "Windows" or os_name.startswith("Win"):
        return "Windows"
    
    return os_name


async def get_devices():
    headers = get_graph_headers()
    
    devices_by_os = defaultdict(lambda: {"total": 0, "versions": defaultdict(int)})
    
    async with httpx.AsyncClient() as client:
        url = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices"
        params = {
            "$select": "operatingSystem,osVersion",
            "$top": 999
        }
        
        while url:
            response = await client.get(url, headers=headers, params=params if url == "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices" else None)
            
            if response.status_code != 200:
                return {"error": "Failed to fetch managed devices", "details": response.text}
            
            data = response.json()
            devices = data.get("value", [])
            
            for device in devices:
                os_name = device.get("operatingSystem", "")
                os_version = device.get("osVersion", "Unknown")
                
                if not os_name or os_name == "Unknown":
                    os_name = "Unknown"
                else:
                    os_name = normalize_os_name(os_name)
                
                if os_name == "iOS":
                    try:
                        parts = os_version.split(".")
                        if len(parts) >= 2:
                            parsed_version = f"{parts[0]}.{parts[1]}"
                        elif len(parts) == 1 and parts[0].isdigit():
                            parsed_version = f"{parts[0]}.0"
                        else:
                            parsed_version = "Unknown"
                    except:
                        parsed_version = "Unknown"
                else:
                    parsed_version = parse_version(os_version, os_name)
                
                devices_by_os[os_name]["total"] += 1
                devices_by_os[os_name]["versions"][parsed_version] += 1
            
            url = data.get("@odata.nextLink")
            params = None
    
    os_summary = []
    for os_name, data in sorted(devices_by_os.items(), key=lambda x: x[1]["total"], reverse=True):
        os_total = data["total"]
        versions = []
        for v, c in sorted(data["versions"].items(), key=lambda x: x[1], reverse=True):
            percentage = (c / os_total * 100) if os_total > 0 else 0
            versions.append({
                "version": v,
                "count": c,
                "percentage": round(percentage, 1)
            })
        
        os_summary.append({
            "os": os_name,
            "total": os_total,
            "versions": versions
        })
    
    total_devices = sum(d["total"] for d in os_summary)
    
    for os_data in os_summary:
        os_data["proportion"] = round((os_data["total"] / total_devices * 100) if total_devices > 0 else 0, 1)
    
    return {
        "devices": os_summary,
        "total": total_devices
    }
