import httpx
from services.graph_client import get_graph_headers, is_configured


async def get_defender_alerts(config_id: int = None):
    """
    Fetch active XDR alerts from Microsoft Defender for Endpoint/Cloud.
    
    Required Azure AD Permissions:
    - Alert.Read.All
    - SecurityAlert.Read.All
    
    API: https://graph.microsoft.com/v1.0/security/alerts
    """
    if not is_configured(config_id):
        return {
            "total_alerts": 0,
            "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "by_status": {"new": 0, "inProgress": 0, "resolved": 0},
            "by_category": {},
            "alerts": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/alerts?$top=100&$filter=severity ne 'informational'",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                alerts = data.get("value", [])
                
                severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}
                statuses = {"new": 0, "inProgress": 0, "resolved": 0}
                categories = {}
                alerts_detail = []
                
                for alert in alerts:
                    severity = alert.get("severity", "low")
                    status = alert.get("alertState", "new")
                    category = alert.get("category", "Unknown")
                    
                    if severity in severities:
                        severities[severity] += 1
                    
                    if status in statuses:
                        statuses[status] += 1
                    
                    if category not in categories:
                        categories[category] = 0
                    categories[category] += 1
                    
                    alerts_detail.append({
                        "id": alert.get("id"),
                        "title": alert.get("title"),
                        "severity": severity,
                        "status": status,
                        "category": category,
                        "created_date_time": alert.get("createdDateTime"),
                        "detection_source": alert.get("detectionSource"),
                        "cloud_app": alert.get("cloudAppStates", [{}])[0].get("name") if alert.get("cloudAppStates") else None,
                        "device": alert.get("deviceStates", [{}])[0].get("name") if alert.get("deviceStates") else None
                    })
                
                return {
                    "total_alerts": len(alerts),
                    "by_severity": severities,
                    "by_status": statuses,
                    "by_category": categories,
                    "alerts": alerts_detail[:20],
                    "error": None
                }
            else:
                return {
                    "total_alerts": 0,
                    "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                    "by_status": {"new": 0, "inProgress": 0, "resolved": 0},
                    "by_category": {},
                    "alerts": [],
                    "error": f"Failed to fetch defender alerts: {response.status_code}"
                }
        except Exception as e:
            return {
                "total_alerts": 0,
                "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "by_status": {"new": 0, "inProgress": 0, "resolved": 0},
                "by_category": {},
                "alerts": [],
                "error": str(e)
            }


async def get_defender_incidents(config_id: int = None):
    """
    Fetch incidents from Microsoft Defender for Endpoint/Cloud.
    
    Required Azure AD Permissions:
    - Incident.Read.All
    
    API: https://graph.microsoft.com/v1.0/security/incidents
    """
    if not is_configured(config_id):
        return {
            "total_incidents": 0,
            "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "by_status": {"active": 0, "resolved": 0},
            "incidents": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/incidents?$top=50",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                incidents = data.get("value", [])
                
                severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}
                statuses = {"active": 0, "resolved": 0}
                incidents_detail = []
                
                for incident in incidents:
                    severity = incident.get("severity", "low")
                    status = incident.get("status", "active")
                    
                    if severity in severities:
                        severities[severity] += 1
                    
                    if status in statuses:
                        statuses[status] += 1
                    
                    incidents_detail.append({
                        "id": incident.get("id"),
                        "title": incident.get("title"),
                        "severity": severity,
                        "status": status,
                        "created_date_time": incident.get("createdDateTime"),
                        "alert_count": len(incident.get("alerts", [])),
                        "assigned_to": incident.get("assignedTo")
                    })
                
                return {
                    "total_incidents": len(incidents),
                    "by_severity": severities,
                    "by_status": statuses,
                    "incidents": incidents_detail[:20],
                    "error": None
                }
            else:
                return {
                    "total_incidents": 0,
                    "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                    "by_status": {"active": 0, "resolved": 0},
                    "incidents": [],
                    "error": f"Failed to fetch incidents: {response.status_code}"
                }
        except Exception as e:
            return {
                "total_incidents": 0,
                "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "by_status": {"active": 0, "resolved": 0},
                "incidents": [],
                "error": str(e)
            }
