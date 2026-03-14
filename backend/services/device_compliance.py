import httpx
from services.graph_client import get_graph_headers, is_configured


def get_windows_version(version: str) -> dict:
    """Parse Windows version to identify Windows 11"""
    version = version or ""
    
    # Windows 11 versions start with 22H2 or later (build 22000+)
    if "11" in version:
        return {"name": "Windows 11", "version": version}
    
    # Try to get build number
    try:
        # Check for build number in version string
        if "Build" in version:
            build_part = version.split("Build")[-1].strip().split()[0]
            build = int(build_part) if build_part.isdigit() else 0
            if build >= 22000:
                return {"name": "Windows 11", "version": version}
    except:
        pass
    
    return {"name": "Windows 10+", "version": version}


def format_os_version(os_type: str, version: str) -> str:
    """Format OS version - for macOS and iOS take only XX.X"""
    if not version:
        return "Unknown"
    
    # Strip parenthetical suffix first (e.g., "26.3 (5ED657)" -> "26.3")
    version = version.split("(")[0].strip()
    
    if os_type.lower() == "macos":
        parts = version.split(".")
        if len(parts) >= 2:
            return f"{parts[0]}.{parts[1]}"
        return version
    
    elif os_type.lower() == "ios":
        parts = version.split(".")
        if len(parts) >= 2:
            return f"{parts[0]}.{parts[1]}"
        return version
    
    elif os_type.lower() == "windows":
        win_info = get_windows_version(version)
        return win_info["name"]
    
    return version


async def get_device_compliance(config_id: int = None):
    if not is_configured(config_id):
        return {
            "total_devices": 0,
            "compliant_devices": 0,
            "non_compliant_devices": 0,
            "by_os": [],
            "by_os_version": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        # Get device compliance from Intune
        response = await client.get(
            "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?$top=500",
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code != 200:
            return {
                "total_devices": 0,
                "compliant_devices": 0,
                "non_compliant_devices": 0,
                "by_os": [],
                "by_os_version": [],
                "error": f"Failed to fetch devices: {response.status_code}"
            }
        
        data = response.json()
        devices = data.get("value", [])
        
        # Also handle pagination
        while "@odata.nextLink" in data:
            next_response = await client.get(
                data["@odata.nextLink"],
                headers=headers,
                timeout=30.0
            )
            if next_response.status_code == 200:
                next_data = next_response.json()
                devices.extend(next_data.get("value", []))
                data = next_data
            else:
                break
        
        # Count by OS and compliance
        os_counts = {}
        os_version_counts = {}
        compliant = 0
        non_compliant = 0
        
        for device in devices:
            os = device.get("operatingSystem", "Unknown")
            os_version = device.get("osVersion", "")
            compliance_state = device.get("complianceState", "unknown")
            
            # Format version based on OS type
            formatted_version = format_os_version(os, os_version)
            
            # OS summary
            if os not in os_counts:
                os_counts[os] = {"total": 0, "compliant": 0, "non_compliant": 0}
            
            os_counts[os]["total"] += 1
            
            # OS Version summary
            version_key = f"{os} {formatted_version}"
            if version_key not in os_version_counts:
                os_version_counts[version_key] = {"total": 0, "compliant": 0, "non_compliant": 0}
            
            os_version_counts[version_key]["total"] += 1
            
            if compliance_state == "compliant":
                compliant += 1
                os_counts[os]["compliant"] += 1
                os_version_counts[version_key]["compliant"] += 1
            elif compliance_state == "noncompliant":
                non_compliant += 1
                os_counts[os]["non_compliant"] += 1
                os_version_counts[version_key]["non_compliant"] += 1
        
        # Format by OS
        by_os = []
        for os, counts in os_counts.items():
            by_os.append({
                "os": os,
                "total": counts["total"],
                "compliant": counts["compliant"],
                "non_compliant": counts["non_compliant"],
                "percentage": round(counts["compliant"] / counts["total"] * 100, 1) if counts["total"] > 0 else 0
            })
        
        # Format by OS version
        by_os_version = []
        for version_key, counts in os_version_counts.items():
            by_os_version.append({
                "os": version_key,
                "total": counts["total"],
                "compliant": counts["compliant"],
                "non_compliant": counts["non_compliant"],
                "percentage": round(counts["compliant"] / counts["total"] * 100, 1) if counts["total"] > 0 else 0
            })
        
        # Sort by total devices
        by_os = sorted(by_os, key=lambda x: x["total"], reverse=True)
        by_os_version = sorted(by_os_version, key=lambda x: x["total"], reverse=True)
        
        return {
            "total_devices": len(devices),
            "compliant_devices": compliant,
            "non_compliant_devices": non_compliant,
            "compliance_percentage": round(compliant / len(devices) * 100, 1) if len(devices) > 0 else 0,
            "by_os": by_os,
            "by_os_version": by_os_version[:20]  # Limit to top 20
        }
