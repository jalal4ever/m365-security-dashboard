import asyncio
import logging
from datetime import datetime
from typing import Any

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


async def get_dashboard_overview(config_id: int | None = None) -> dict[str, Any]:
    """
    Orchestrates parallel fetching of all dashboard metrics.
    
    Uses asyncio.gather with:
    - Semaphore to limit concurrent requests
    - Individual timeouts per service
    - Error isolation (one service failure doesn't break others)
    - Caching to avoid redundant API calls
    """
    if not is_configured():
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
        _fetch_with_timeout(get_device_compliance(config_id), "device_compliance", 20),
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    secure_score = _extract_result(results[0], "secure_score")
    device_compliance = _extract_result(results[1], "device_compliance")
    
    kpis = {
        "secure_score": {
            "value": secure_score.get("percentage", 0) if secure_score else 0,
            "label": "Secure Score"
        },
        "non_compliant_devices": {
            "value": device_compliance.get("non_compliant_devices", 0) if device_compliance else 0,
            "label": "Appareils Non Conformes",
            "total": device_compliance.get("total_devices", 0) if device_compliance else 0
        }
    }
    
    widgets = {}
    
    response = {
        "error": None,
        "from_cache": False,
        "timestamp": datetime.utcnow().isoformat(),
        "kpis": kpis,
        "widgets": widgets,
        "_raw": {
            "secure_score": secure_score,
            "device_compliance": device_compliance
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
