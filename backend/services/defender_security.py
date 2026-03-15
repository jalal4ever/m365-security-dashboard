import httpx
from services.graph_client import get_graph_headers, is_configured
from collections import defaultdict
from datetime import datetime

async def get_user_security_alerts():
    """
    Fetch security alerts from Microsoft Defender and aggregate them by user.
    Required Permissions: SecurityAlert.Read.All
    """
    if not is_configured():
        return {"error": "Azure configuration missing", "top_users": []}

    headers = get_graph_headers()
    
    async with httpx.AsyncClient() as client:
        try:
            # Fetch recent alerts
            # Status can be: newAlert, inProgress, resolved, dismissed
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/alerts?$top=1000",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code != 200:
                return {"error": f"Failed to fetch alerts: {response.status_code}", "top_users": []}
            
            data = response.json()
            alerts = data.get("value", [])
            
            # Map for severity weight
            severity_map = {
                "high": 100,
                "medium": 10,
                "low": 1,
                "informational": 0,
                "unknown": 0
            }
            
            user_alerts = defaultdict(list)
            
            for alert in alerts:
                # Only active alerts
                if alert.get("status") not in ["newAlert", "inProgress"]:
                    continue

                # Find UPN
                upn = alert.get("userPrincipalName")
                if not upn:
                    user_states = alert.get("userStates", [])
                    for state in user_states:
                        if state.get("userPrincipalName"):
                            upn = state.get("userPrincipalName")
                            break
                        elif state.get("aadUserId"):
                            upn = f"User ID: {state.get('aadUserId')[:8]}..."
                            break
                
                if not upn:
                    continue
                
                user_alerts[upn].append({
                    "id": alert.get("id"),
                    "title": alert.get("title"),
                    "severity": alert.get("severity"),
                    "created_at": alert.get("createdDateTime"),
                    "status": alert.get("status"),
                    "category": alert.get("category"),
                    "description": alert.get("description")
                })

            # Score users based on severity of alerts
            user_scores = []
            for upn, alerts_list in user_alerts.items():
                score = sum(severity_map.get(a["severity"].lower(), 0) for a in alerts_list)
                # Sort alerts by date desc
                sorted_alerts = sorted(alerts_list, key=lambda x: x["created_at"], reverse=True)
                
                user_scores.append({
                    "user_principal_name": upn,
                    "score": score,
                    "alert_count": len(alerts_list),
                    "recent_alerts": sorted_alerts[:5],
                    "max_severity": max((a["severity"] for a in alerts_list), key=lambda s: severity_map.get(s.lower(), 0), default="low")
                })
            
            # Sort by score and take top 10
            top_users = sorted(user_scores, key=lambda x: x["score"], reverse=True)[:10]
            
            return {
                "total_alerts": len(alerts),
                "top_users": top_users,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e), "top_users": []}
