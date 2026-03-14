import httpx
from datetime import datetime, timedelta
from services.graph_client import get_graph_headers, is_configured


async def get_threat_trends(config_id: int = None):
    """
    Fetch threat evolution/trends data from Microsoft Defender.
    
    Uses multiple sources:
    - Secure Scores history
    - Alert history
    - Incident trends
    
    Required Azure AD Permissions:
    - SecurityAlert.Read.All
    - SecureScores.Read.All
    - Incident.Read.All
    """
    if not is_configured(config_id):
        return {
            "secure_score_trend": [],
            "alert_trend": [],
            "threat_category_trend": {},
            "summary": {
                "score_change_30d": 0,
                "alerts_change_30d": 0,
                "critical_alerts_current": 0
            },
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            secure_score_trend = await _fetch_secure_score_trend(client, headers)
            alert_trend = await _fetch_alert_trend(client, headers)
            
            score_change_30d = 0
            if len(secure_score_trend) >= 2:
                score_change_30d = secure_score_trend[0].get("percentage", 0) - secure_score_trend[-1].get("percentage", 0)
            
            alerts_change_30d = 0
            if len(alert_trend) >= 2:
                alerts_change_30d = alert_trend[0].get("count", 0) - alert_trend[-1].get("count", 0)
            
            critical_alerts = 0
            if alert_trend:
                critical_alerts = alert_trend[0].get("critical", 0)
            
            return {
                "secure_score_trend": secure_score_trend,
                "alert_trend": alert_trend,
                "threat_category_trend": {},
                "summary": {
                    "score_change_30d": round(score_change_30d, 1),
                    "alerts_change_30d": alerts_change_30d,
                    "critical_alerts_current": critical_alerts
                },
                "error": None
            }
        except Exception as e:
            return {
                "secure_score_trend": [],
                "alert_trend": [],
                "threat_category_trend": {},
                "summary": {
                    "score_change_30d": 0,
                    "alerts_change_30d": 0,
                    "critical_alerts_current": 0
                },
                "error": str(e)
            }


async def _fetch_secure_score_trend(client: httpx.AsyncClient, headers: dict):
    """Fetch historical secure score data."""
    trend = []
    
    try:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/security/secureScores?$top=30",
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code == 200:
            data = response.json()
            scores = data.get("value", [])
            
            scores_sorted = sorted(
                scores,
                key=lambda s: s.get("createdDateTime", ""),
                reverse=False
            )
            
            for score in scores_sorted:
                percentage = score.get("percentage")
                if percentage is None:
                    current = score.get("currentScore", 0)
                    maxima = score.get("maxScore", 0)
                    percentage = current / maxima * 100 if maxima > 0 else 0
                
                trend.append({
                    "date": score.get("createdDateTime", "").split("T")[0],
                    "score": score.get("currentScore", 0),
                    "max_score": score.get("maxScore", 0),
                    "percentage": round(percentage, 1)
                })
    except Exception:
        pass
    
    return trend


async def _fetch_alert_trend(client: httpx.AsyncClient, headers: dict):
    """Fetch alert trend data by day for the last 30 days."""
    trend = []
    
    try:
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
        
        response = await client.get(
            f"https://graph.microsoft.com/v1.0/security/alerts?$filter=createdDateTime ge {thirty_days_ago}&$top=500",
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code == 200:
            data = response.json()
            alerts = data.get("value", [])
            
            daily_counts = {}
            for alert in alerts:
                created = alert.get("createdDateTime", "")
                if created:
                    date = created.split("T")[0]
                    severity = alert.get("severity", "low")
                    
                    if date not in daily_counts:
                        daily_counts[date] = {"date": date, "count": 0, "critical": 0, "high": 0, "medium": 0, "low": 0}
                    
                    daily_counts[date]["count"] += 1
                    if severity in daily_counts[date]:
                        daily_counts[date][severity] += 1
            
            trend = sorted(daily_counts.values(), key=lambda x: x["date"])
    except Exception:
        pass
    
    return trend


async def get_threat_intelligence(config_id: int = None):
    """
    Fetch threat intelligence indicators from Microsoft Defender.
    
    API: https://graph.microsoft.com/v1.0/security/tiIndicators (if available)
    """
    if not is_configured(config_id):
        return {
            "indicators_count": 0,
            "by_type": {},
            "recent_indicators": [],
            "error": "Azure credentials not configured"
        }

    headers = get_graph_headers(config_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://graph.microsoft.com/v1.0/security/tiIndicators?$top=50",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                indicators = data.get("value", [])
                
                types = {}
                recent = []
                
                for ind in indicators:
                    ind_type = ind.get("indicatorType", "unknown")
                    if ind_type not in types:
                        types[ind_type] = 0
                    types[ind_type] += 1
                    
                    if len(recent) < 10:
                        recent.append({
                            "id": ind.get("id"),
                            "indicator_value": ind.get("indicatorValue"),
                            "indicator_type": ind_type,
                            "severity": ind.get("severity"),
                            "created_date_time": ind.get("createdDateTime"),
                            "expiration_date_time": ind.get("expirationDateTime")
                        })
                
                return {
                    "indicators_count": len(indicators),
                    "by_type": types,
                    "recent_indicators": recent,
                    "error": None
                }
            elif response.status_code == 404:
                return {
                    "indicators_count": 0,
                    "by_type": {},
                    "recent_indicators": [],
                    "error": None
                }
            else:
                return {
                    "indicators_count": 0,
                    "by_type": {},
                    "recent_indicators": [],
                    "error": f"Failed to fetch threat intelligence: {response.status_code}"
                }
        except Exception as e:
            return {
                "indicators_count": 0,
                "by_type": {},
                "recent_indicators": [],
                "error": str(e)
            }
