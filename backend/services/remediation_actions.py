import httpx
from services.graph_client import get_graph_headers, is_configured


async def get_remediation_actions(config_id: int = None):
    """
    Fetch top remediation actions from Microsoft Defender recommendations.
    
    Uses security vendor information and remediation data.
    
    Required Azure AD Permissions:
    - SecurityRecommendation.Read.All
    - SecurityActions.Read.All
    """
    if not is_configured(config_id):
        return {
            "total_actions": 0,
            "top_actions": [],
            "by_status": {"pending": 0, "completed": 0, "in_progress": 0},
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            recommendations = await _fetch_security_recommendations(client, headers)
            actions = await _fetch_security_actions(client, headers)
            
            top_actions = _aggregate_recommendations(recommendations)
            
            return {
                "total_actions": len(recommendations) + len(actions),
                "top_actions": top_actions,
                "by_status": {
                    "pending": len([r for r in recommendations if r.get("status") == "notStarted"]),
                    "completed": len([r for r in recommendations if r.get("status") == "completed"]),
                    "in_progress": len([r for r in recommendations if r.get("status") in ["inProgress", "started"]])
                },
                "error": None
            }
        except Exception as e:
            return {
                "total_actions": 0,
                "top_actions": [],
                "by_status": {"pending": 0, "completed": 0, "in_progress": 0},
                "error": str(e)
            }


async def _fetch_security_recommendations(client: httpx.AsyncClient, headers: dict):
    """Fetch security recommendations from Defender."""
    recommendations = []
    
    try:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/security/recommendations?$top=100",
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code == 200:
            data = response.json()
            recommendations = data.get("value", [])
    except Exception:
        pass
    
    return recommendations


async def _fetch_security_actions(client: httpx.AsyncClient, headers: dict):
    """Fetch security actions/remediation actions."""
    actions = []
    
    try:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/security/actions?$top=50",
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code == 200:
            data = response.json()
            actions = data.get("value", [])
    except Exception:
        pass
    
    return actions


def _aggregate_recommendations(recommendations: list):
    """Aggregate and rank top remediation actions by severity and impact."""
    action_counts = {}
    
    for rec in recommendations:
        title = rec.get("title", "Unknown")
        severity = rec.get("severity", "medium")
        status = rec.get("status", "unknown")
        
        if title not in action_counts:
            action_counts[title] = {
                "title": title,
                "description": rec.get("description", ""),
                "severity": severity,
                "count": 0,
                "status": status,
                "category": rec.get("category", "General"),
                "recommendations": []
            }
        
        action_counts[title]["count"] += 1
        
        if len(action_counts[title]["recommendations"]) < 3:
            action_counts[title]["recommendations"].append({
                "id": rec.get("id"),
                "status": status,
                "impact_score": rec.get("impactScore")
            })
    
    severity_priority = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    
    sorted_actions = sorted(
        action_counts.values(),
        key=lambda x: (
            severity_priority.get(x["severity"], 99),
            -x["count"]
        )
    )
    
    return sorted_actions[:10]


async def get_remediation_summary(config_id: int = None):
    """
    Get a summary of remediation status for the dashboard.
    
    Returns counts and percentages for quick KPI display.
    """
    if not is_configured(config_id):
        return {
            "pending": 0,
            "in_progress": 0,
            "completed": 0,
            "total": 0,
            "completion_rate": 0,
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/recommendations?$top=100",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                recommendations = data.get("value", [])
                
                pending = len([r for r in recommendations if r.get("status") in ["notStarted", "pending"]])
                in_progress = len([r for r in recommendations if r.get("status") in ["started", "inProgress"]])
                completed = len([r for r in recommendations if r.get("status") == "completed"])
                total = len(recommendations)
                
                return {
                    "pending": pending,
                    "in_progress": in_progress,
                    "completed": completed,
                    "total": total,
                    "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
                    "error": None
                }
            else:
                return {
                    "pending": 0,
                    "in_progress": 0,
                    "completed": 0,
                    "total": 0,
                    "completion_rate": 0,
                    "error": f"Failed to fetch remediation: {response.status_code}"
                }
        except Exception as e:
            return {
                "pending": 0,
                "in_progress": 0,
                "completed": 0,
                "total": 0,
                "completion_rate": 0,
                "error": str(e)
            }
