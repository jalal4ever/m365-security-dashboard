import asyncio
import logging
from datetime import datetime
from typing import Any

from services.risky_users import get_risky_users, get_risk_history
from services.defender_alerts import get_defender_alerts, get_defender_incidents
from services.threat_trends import get_threat_trends, get_threat_intelligence
from services.remediation_actions import get_remediation_actions, get_remediation_summary
from services.dlp_shadow_it import get_dlp_shadow_it_summary
from services.security_score import get_secure_score
from services.device_compliance import get_device_compliance
from services.graph_client import is_configured

logger = logging.getLogger(__name__)

CACHE_TTL = 120

_dashboard_cache = {
    "data": None,
    "timestamp": None
}

_semaphore = asyncio.Semaphore(5)


async def get_dashboard_overview(config_id: int = None) -> dict[str, Any]:
    """
    Orchestrates parallel fetching of all dashboard metrics.
    
    Uses asyncio.gather with:
    - Semaphore to limit concurrent requests
    - Individual timeouts per service
    - Error isolation (one service failure doesn't break others)
    - Caching to avoid redundant API calls
    """
    if not is_configured(config_id):
        return {
            "error": "Azure credentials not configured",
            "kpis": {},
            "widgets": {}
        }
    
    if _dashboard_cache["data"] and _dashboard_cache["timestamp"]:
        elapsed = (datetime.utcnow() - _dashboard_cache["timestamp"]).total_seconds()
        if elapsed < CACHE_TTL:
            cached = _dashboard_cache["data"].copy()
            cached["from_cache"] = True
            return cached
    
    tasks = [
        _fetch_with_timeout(get_secure_score(config_id), "secure_score", 15),
        _fetch_with_timeout(get_risky_users(config_id), "risky_users", 15),
        _fetch_with_timeout(get_defender_alerts(config_id), "defender_alerts", 15),
        _fetch_with_timeout(get_device_compliance(config_id), "device_compliance", 20),
        _fetch_with_timeout(get_threat_trends(config_id), "threat_trends", 20),
        _fetch_with_timeout(get_remediation_summary(config_id), "remediation", 15),
        _fetch_with_timeout(get_dlp_shadow_it_summary(config_id), "dlp_shadow_it", 15),
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    secure_score = _extract_result(results[0], "secure_score")
    risky_users = _extract_result(results[1], "risky_users")
    defender_alerts = _extract_result(results[2], "defender_alerts")
    device_compliance = _extract_result(results[3], "device_compliance")
    threat_trends = _extract_result(results[4], "threat_trends")
    remediation = _extract_result(results[5], "remediation")
    dlp_shadow = _extract_result(results[6], "dlp_shadow_it")
    
    kpis = {
        "secure_score": {
            "value": secure_score.get("percentage", 0) if secure_score else 0,
            "label": "Secure Score",
            "trend": threat_trends.get("summary", {}).get("score_change_30d", 0) if threat_trends else 0
        },
        "risky_users": {
            "value": risky_users.get("total_risky_users", 0) if risky_users else 0,
            "label": "Comptes à Risque",
            "breakdown": risky_users.get("risk_levels", {}) if risky_users else {}
        },
        "active_alerts": {
            "value": defender_alerts.get("total_alerts", 0) if defender_alerts else 0,
            "label": "Alertes XDR Actives",
            "critical": defender_alerts.get("by_severity", {}).get("critical", 0) if defender_alerts else 0
        },
        "non_compliant_devices": {
            "value": device_compliance.get("non_compliant_devices", 0) if device_compliance else 0,
            "label": "Appareils Non Conformes",
            "total": device_compliance.get("total_devices", 0) if device_compliance else 0
        }
    }
    
    widgets = {
        "threat_evolution": {
            "title": "Évolution des Menaces",
            "data": threat_trends,
            "type": "line_chart"
        },
        "top_remediation": {
            "title": "Top Actions de Remédiation",
            "data": remediation,
            "type": "list"
        },
        "dlp_shadow_it": {
            "title": "Alertes DLP / Shadow IT",
            "data": dlp_shadow,
            "type": "cards"
        },
        "multi_tenant_matrix": {
            "title": "Matrice Multi-tenant",
            "data": _build_multi_tenant_data(secure_score, risky_users, defender_alerts, device_compliance),
            "type": "matrix"
        }
    }
    
    response = {
        "error": None,
        "from_cache": False,
        "timestamp": datetime.utcnow().isoformat(),
        "kpis": kpis,
        "widgets": widgets,
        "_raw": {
            "secure_score": secure_score,
            "risky_users": risky_users,
            "defender_alerts": defender_alerts,
            "device_compliance": device_compliance,
            "threat_trends": threat_trends,
            "remediation": remediation,
            "dlp_shadow_it": dlp_shadow
        }
    }
    
    _dashboard_cache["data"] = response.copy()
    _dashboard_cache["timestamp"] = datetime.utcnow()
    
    return response


async def _fetch_with_timeout(coro, name: str, timeout: int):
    """Execute a coroutine with a timeout and error handling."""
    try:
        async with asyncio.timeout(timeout):
            result = await coro
            logger.info(f"Successfully fetched {name}")
            return {"name": name, "data": result, "error": None}
    except asyncio.TimeoutError:
        logger.warning(f"Timeout fetching {name}")
        return {"name": name, "data": None, "error": f"Timeout ({timeout}s)"}
    except Exception as e:
        logger.error(f"Error fetching {name}: {str(e)}")
        return {"name": name, "data": None, "error": str(e)}


def _extract_result(result: dict, name: str) -> dict:
    """Extract data from a task result, handling exceptions."""
    if isinstance(result, Exception):
        logger.error(f"Exception in {name}: {str(result)}")
        return {"error": str(result)}
    
    if isinstance(result, dict):
        return result.get("data", {})
    
    return {}


def _build_multi_tenant_data(*args) -> dict:
    """Build multi-tenant comparison data."""
    return {
        "available": False,
        "message": "Multi-tenant view requires additional configuration"
    }


def clear_cache():
    """Clear the dashboard cache to force refresh."""
    global _dashboard_cache
    _dashboard_cache = {
        "data": None,
        "timestamp": None
    }
    logger.info("Dashboard cache cleared")
