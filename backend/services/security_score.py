import httpx
from services.graph_client import get_graph_headers


async def get_secure_score():
    headers = get_graph_headers()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/security/secureScores",
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            if "value" in data and len(data["value"]) > 0:
                score_data = data["value"][0]
                return {
                    "score": score_data.get("currentScore", 0),
                    "max_score": score_data.get("maxScore", 0),
                    "percentage": score_data.get("currentScore", 0) / score_data.get("maxScore", 1) * 100 if score_data.get("maxScore", 1) > 0 else 0,
                    "enabled_standards": score_data.get("enabledStandards", []),
                    "licensed": score_data.get("licensed", False)
                }
        return {"error": "Failed to fetch secure score", "details": response.text}
