import httpx
from services.graph_client import get_graph_headers, is_configured


async def get_dlp_alerts(config_id: int = None):
    """
    Fetch DLP (Data Loss Prevention) alerts from Microsoft Purview.
    
    Required Azure AD Permissions:
    - DataLossPreventionPreventionEvaluation.Read.All
    - DataLossPreventionPolicy.Evaluate
    
    API: https://graph.microsoft.com/v1.0/security/dataLossPrevention/preview
    Note: Uses compliance center API for DLP events.
    """
    if not is_configured(config_id):
        return {
            "total_alerts": 0,
            "by_severity": {"high": 0, "medium": 0, "low": 0},
            "by_policy": {},
            "recent_alerts": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/dataLossPrevention/alerts?$top=100",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                alerts = data.get("value", [])
                
                severities = {"high": 0, "medium": 0, "low": 0}
                policies = {}
                recent = []
                
                for alert in alerts:
                    severity = alert.get("severity", "low")
                    policy = alert.get("policyName", "Unknown")
                    
                    if severity in severities:
                        severities[severity] += 1
                    
                    if policy not in policies:
                        policies[policy] = 0
                    policies[policy] += 1
                    
                    if len(recent) < 10:
                        recent.append({
                            "id": alert.get("id"),
                            "title": alert.get("title"),
                            "severity": severity,
                            "policy": policy,
                            "created_date_time": alert.get("createdDateTime"),
                            "user": alert.get("userId"),
                            "location": alert.get("location")
                        })
                
                return {
                    "total_alerts": len(alerts),
                    "by_severity": severities,
                    "by_policy": policies,
                    "recent_alerts": recent,
                    "error": None
                }
            elif response.status_code == 404:
                return {
                    "total_alerts": 0,
                    "by_severity": {"high": 0, "medium": 0, "low": 0},
                    "by_policy": {},
                    "recent_alerts": [],
                    "error": None
                }
            else:
                return {
                    "total_alerts": 0,
                    "by_severity": {"high": 0, "medium": 0, "low": 0},
                    "by_policy": {},
                    "recent_alerts": [],
                    "error": f"Failed to fetch DLP alerts: {response.status_code}"
                }
        except Exception as e:
            return {
                "total_alerts": 0,
                "by_severity": {"high": 0, "medium": 0, "low": 0},
                "by_policy": {},
                "recent_alerts": [],
                "error": str(e)
            }


async def get_shadow_it_apps(config_id: int = None):
    """
    Fetch Shadow IT / Cloud App Discovery from Microsoft Defender for Cloud Apps.
    
    Required Azure AD Permissions:
    - CloudApp.Read.All
    
    API: https://graph.microsoft.com/v1.0/security/cloudAppDiscovery
    """
    if not is_configured(config_id):
        return {
            "total_apps": 0,
            "by_risk": {"high": 0, "medium": 0, "low": 0},
            "by_category": {},
            "discovered_apps": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/cloudAppDiscovery?$top=100",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                apps = data.get("value", [])
                
                risks = {"high": 0, "medium": 0, "low": 0}
                categories = {}
                discovered = []
                
                for app in apps:
                    risk = app.get("riskLevel", "low")
                    category = app.get("category", "Other")
                    
                    if risk in risks:
                        risks[risk] += 1
                    
                    if category not in categories:
                        categories[category] = 0
                    categories[category] += 1
                    
                    if len(discovered) < 15:
                        discovered.append({
                            "id": app.get("id"),
                            "name": app.get("name"),
                            "domain": app.get("domain"),
                            "risk_level": risk,
                            "category": category,
                            "usage_count": app.get("usageCount", 0),
                            "last_seen": app.get("lastSeenDateTime")
                        })
                
                return {
                    "total_apps": len(apps),
                    "by_risk": risks,
                    "by_category": categories,
                    "discovered_apps": discovered,
                    "error": None
                }
            elif response.status_code == 404:
                return {
                    "total_apps": 0,
                    "by_risk": {"high": 0, "medium": 0, "low": 0},
                    "by_category": {},
                    "discovered_apps": [],
                    "error": None
                }
            else:
                return {
                    "total_apps": 0,
                    "by_risk": {"high": 0, "medium": 0, "low": 0},
                    "by_category": {},
                    "discovered_apps": [],
                    "error": f"Failed to fetch Shadow IT: {response.status_code}"
                }
        except Exception as e:
            return {
                "total_apps": 0,
                "by_risk": {"high": 0, "medium": 0, "low": 0},
                "by_category": {},
                "discovered_apps": [],
                "error": str(e)
            }


async def get_dlp_shadow_it_summary(config_id: int = None):
    """
    Combined DLP and Shadow IT summary for dashboard KPI.
    """
    dlp = await get_dlp_alerts(config_id)
    shadow = await get_shadow_it_apps(config_id)
    
    return {
        "dlp": {
            "total_alerts": dlp.get("total_alerts", 0),
            "high_severity": dlp.get("by_severity", {}).get("high", 0)
        },
        "shadow_it": {
            "total_apps": shadow.get("total_apps", 0),
            "high_risk_apps": shadow.get("by_risk", {}).get("high", 0)
        },
        "error": dlp.get("error") or shadow.get("error")
    }
