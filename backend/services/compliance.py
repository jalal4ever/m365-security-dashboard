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


async def get_compliance():
    headers = get_graph_headers()
    
    compliant = 0
    non_compliant = 0
    unknown = 0
    
    os_data = defaultdict(lambda: {"total": 0, "compliant": 0, "non_compliant": 0, "versions": defaultdict(lambda: {"total": 0, "compliant": 0, "non_compliant": 0})})
    
    async with httpx.AsyncClient() as client:
        url = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices"
        params = {
            "$select": "operatingSystem,osVersion,complianceState",
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
                compliance = device.get("complianceState", "unknown")
                
                if not os_name or os_name == "Unknown":
                    os_name = "Unknown"
                else:
                    os_name = normalize_os_name(os_name)
                
                if compliance == "compliant":
                    compliant += 1
                    is_compliant = True
                elif compliance == "noncompliant":
                    non_compliant += 1
                    is_compliant = False
                else:
                    unknown += 1
                    is_compliant = None
                
                os_data[os_name]["total"] += 1
                
                if is_compliant is True:
                    os_data[os_name]["compliant"] += 1
                elif is_compliant is False:
                    os_data[os_name]["non_compliant"] += 1
                
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
                
                os_data[os_name]["versions"][parsed_version]["total"] += 1
                if is_compliant is True:
                    os_data[os_name]["versions"][parsed_version]["compliant"] += 1
                elif is_compliant is False:
                    os_data[os_name]["versions"][parsed_version]["non_compliant"] += 1
            
            url = data.get("@odata.nextLink")
            params = None
    
    total = compliant + non_compliant + unknown
    
    os_summary = []
    for os_name, data in sorted(os_data.items(), key=lambda x: x[1]["total"], reverse=True):
        os_total = data["total"]
        compliant_pct = (data["compliant"] / os_total * 100) if os_total > 0 else 0
        
        versions_list = []
        for v, v_data in sorted(data["versions"].items(), key=lambda x: x[1]["total"], reverse=True):
            v_total = v_data["total"]
            v_compliant_pct = (v_data["compliant"] / v_total * 100) if v_total > 0 else 0
            versions_list.append({
                "version": v,
                "total": v_total,
                "compliant": v_data["compliant"],
                "non_compliant": v_data["non_compliant"],
                "compliant_percentage": round(v_compliant_pct, 1)
            })
        
        os_summary.append({
            "os": os_name,
            "total": os_total,
            "compliant": data["compliant"],
            "non_compliant": data["non_compliant"],
            "compliant_percentage": round(compliant_pct, 1),
            "versions": versions_list
        })
    
    total_compliant_pct = (compliant / total * 100) if total > 0 else 0
    total_non_compliant_pct = (non_compliant / total * 100) if total > 0 else 0
    
    return {
        "summary": {
            "total": total,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "unknown": unknown,
            "compliant_percentage": round(total_compliant_pct, 1),
            "non_compliant_percentage": round(total_non_compliant_pct, 1)
        },
        "by_os": os_summary
    }
