import httpx
from services.graph_client import get_graph_headers, is_configured


async def get_risky_users(config_id: int = None):
    """
    Fetch risky users from Microsoft Identity Protection (Azure AD).
    
    Required Azure AD Permissions:
    - IdentityRiskEvent.Read.All
    - IdentityRiskyUser.Read.All
    
    API: https://graph.microsoft.com/v1.0/identityProtection/riskyUsers
    """
    if not is_configured(config_id):
        return {
            "total_risky_users": 0,
            "risk_levels": {"high": 0, "medium": 0, "low": 0},
            "users": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/identityProtection/riskyUsers?$top=100",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                risky_users = data.get("value", [])
                
                risk_levels = {"high": 0, "medium": 0, "low": 0}
                users_detail = []
                
                for user in risky_users:
                    risk_level = user.get("riskLevel", "unknown")
                    if risk_level in risk_levels:
                        risk_levels[risk_level] += 1
                    
                    users_detail.append({
                        "id": user.get("id"),
                        "user_principal_name": user.get("userPrincipalName"),
                        "risk_level": risk_level,
                        "risk_state": user.get("riskState"),
                        "risk_last_updated_date_time": user.get("riskLastUpdatedDateTime"),
                        "is_processing": user.get("isProcessing")
                    })
                
                return {
                    "total_risky_users": len(risky_users),
                    "risk_levels": risk_levels,
                    "users": users_detail,
                    "error": None
                }
            else:
                return {
                    "total_risky_users": 0,
                    "risk_levels": {"high": 0, "medium": 0, "low": 0},
                    "users": [],
                    "error": f"Failed to fetch risky users: {response.status_code}"
                }
        except Exception as e:
            return {
                "total_risky_users": 0,
                "risk_levels": {"high": 0, "medium": 0, "low": 0},
                "users": [],
                "error": str(e)
            }


async def get_risk_history(config_id: int = None):
    """
    Fetch risk events history for trend analysis.
    
    Required Azure AD Permissions:
    - IdentityRiskEvent.Read.All
    
    API: https://graph.microsoft.com/v1.0/identityProtection/riskDetections
    """
    if not is_configured(config_id):
        return {
            "total_events": 0,
            "by_risk_type": {},
            "by_severity": {"high": 0, "medium": 0, "low": 0},
            "recent_events": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/identityProtection/riskDetections?$top=100&$orderBy=detectedDateTime desc",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                events = data.get("value", [])
                
                risk_types = {}
                severities = {"high": 0, "medium": 0, "low": 0}
                recent_events = []
                
                for event in events[:50]:
                    risk_type = event.get("riskType", "unknown")
                    severity = event.get("riskLevel", "low")
                    
                    if risk_type not in risk_types:
                        risk_types[risk_type] = 0
                    risk_types[risk_type] += 1
                    
                    if severity in severities:
                        severities[severity] += 1
                    
                    recent_events.append({
                        "id": event.get("id"),
                        "risk_type": risk_type,
                        "risk_level": severity,
                        "detected_date_time": event.get("detectedDateTime"),
                        "user_principal_name": event.get("userPrincipalName"),
                        "ip_address": event.get("ipAddress"),
                        "location": event.get("location")
                    })
                
                return {
                    "total_events": len(events),
                    "by_risk_type": risk_types,
                    "by_severity": severities,
                    "recent_events": recent_events,
                    "error": None
                }
            else:
                return {
                    "total_events": 0,
                    "by_risk_type": {},
                    "by_severity": {"high": 0, "medium": 0, "low": 0},
                    "recent_events": [],
                    "error": f"Failed to fetch risk history: {response.status_code}"
                }
        except Exception as e:
            return {
                "total_events": 0,
                "by_risk_type": {},
                "by_severity": {"high": 0, "medium": 0, "low": 0},
                "recent_events": [],
                "error": str(e)
            }
