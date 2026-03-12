import httpx
from services.graph_client import get_graph_headers


async def get_licenses():
    headers = get_graph_headers()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/subscribedSkus",
            headers=headers
        )
        
        if response.status_code != 200:
            return {"error": "Failed to fetch licenses", "details": response.text}
        
        data = response.json()
        licenses = []
        
        for sku in data.get("value", []):
            consumed = sku.get("consumedUnits", 0)
            total = sku.get("prepaidUnits", {}).get("enabled", 0)
            available = total - consumed
            
            licenses.append({
                "sku_id": sku.get("skuId"),
                "sku_part_number": sku.get("skuPartNumber"),
                "consumed_units": consumed,
                "total_licenses": total,
                "available_licenses": available,
                "service_plan_names": [sp.get("serviceName") for sp in sku.get("servicePlans", [])]
            })
        
        total_consumed = sum(license_entry["consumed_units"] for license_entry in licenses)
        total_available = sum(license_entry["available_licenses"] for license_entry in licenses)
        
        return {
            "licenses": licenses,
            "summary": {
                "total_consumed": total_consumed,
                "total_available": total_available,
                "total_licenses": total_consumed + total_available
            }
        }
