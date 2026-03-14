from fastapi import APIRouter, Query
from services.dashboard_orchestrator import get_dashboard_overview, clear_cache

router = APIRouter()


@router.get("/dashboard/overview")
async def dashboard_overview(config_id: int | None = Query(None, description="Azure config ID")):
    """
    Get comprehensive dashboard overview for DSI Single Pane of Glass view.
    
    Returns:
    - KPIs: Secure Score, Risky Users, Active XDR Alerts, Non-Compliant Devices
    - Widgets: Threat Evolution, Top Remediation Actions, DLP/Shadow IT, Multi-tenant Matrix
    """
    return await get_dashboard_overview(config_id)


@router.post("/dashboard/clear-cache")
async def dashboard_clear_cache():
    """Clear the dashboard cache to force fresh data fetch."""
    clear_cache()
    return {"status": "cache_cleared"}


@router.get("/dashboard/health")
async def dashboard_health(config_id: int | None = Query(None, description="Azure config ID")):
    """Quick health check for dashboard services."""
    from services.graph_client import is_configured
    
    return {
        "configured": is_configured(config_id),
        "services": {
            "graph": is_configured(config_id)
        }
    }
