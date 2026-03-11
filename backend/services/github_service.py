import os
import logging
import json
from datetime import datetime
from typing import Optional
import httpx

logger = logging.getLogger(__name__)


class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    def _make_request(self, method: str, endpoint: str, data: Optional[dict] = None) -> dict:
        if not self.token:
            logger.error("GitHub token not configured")
            return {"error": "GitHub token not configured"}

        url = f"{self.base_url}{endpoint}"
        
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data
                )
                
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                elif response.status_code == 201:
                    return {"success": True, "data": response.json()}
                elif response.status_code == 401:
                    logger.error("GitHub authentication failed - invalid token")
                    return {"error": "Authentication failed - check token permissions"}
                elif response.status_code == 403:
                    logger.warning("GitHub API rate limit or permission denied")
                    return {"error": "Permission denied or rate limited"}
                elif response.status_code == 404:
                    return {"error": "Resource not found"}
                else:
                    logger.error(f"GitHub API error: {response.status_code} - {response.text}")
                    return {"error": f"API error: {response.status_code}"}
                    
        except httpx.TimeoutException:
            logger.error("GitHub API timeout")
            return {"error": "Request timeout"}
        except httpx.RequestError as e:
            logger.error(f"GitHub request error: {str(e)}")
            return {"error": f"Request failed: {str(e)}"}
        except Exception as e:
            logger.exception("Unexpected GitHub error")
            return {"error": f"Unexpected error: {str(e)}"}

    def get_current_user(self) -> dict:
        return self._make_request("GET", "/user")

    def list_repos(self) -> dict:
        return self._make_request("GET", "/user/repos?per_page=100&sort=updated")

    def create_repo(self, name: str, description: str = "", private: bool = False) -> dict:
        data = {
            "name": name,
            "description": description,
            "private": private,
            "auto_init": True
        }
        return self._make_request("POST", "/user/repos", data)

    def get_repo(self, owner: str, repo: str) -> dict:
        return self._make_request("GET", f"/repos/{owner}/{repo}")

    def create_branch(self, owner: str, repo: str, branch: str, from_branch: str = "main") -> dict:
        base_ref = self._make_request("GET", f"/repos/{owner}/{repo}/git/ref/heads/{from_branch}")
        if "error" in base_ref:
            return base_ref

        data = {
            "ref": f"refs/heads/{branch}",
            "sha": base_ref["data"]["object"]["sha"]
        }
        return self._make_request("POST", f"/repos/{owner}/{repo}/git/refs", data)

    def create_pull_request(self, owner: str, repo: str, title: str, body: str, head: str, base: str = "main") -> dict:
        data = {
            "title": title,
            "body": body,
            "head": head,
            "base": base
        }
        return self._make_request("POST", f"/repos/{owner}/{repo}/pulls", data)

    def list_pulls(self, owner: str, repo: str, state: str = "open") -> dict:
        return self._make_request("GET", f"/repos/{owner}/{repo}/pulls?state={state}")

    def merge_pull_request(self, owner: str, repo: str, pull_number: int, commit_title: str = "") -> dict:
        data = {"commit_title": commit_title} if commit_title else {}
        return self._make_request("PUT", f"/repos/{owner}/{repo}/pulls/{pull_number}/merge", data)

    def get_workflow_runs(self, owner: str, repo: str) -> dict:
        return self._make_request("GET", f"/repos/{owner}/{repo}/actions/runs")

    def trigger_workflow(self, owner: str, repo: str, workflow_id: str, ref: str = "main") -> dict:
        data = {"ref": ref}
        return self._make_request("POST", f"/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches", data)


class GitHubLogger:
    @staticmethod
    def log_event(event_type: str, details: dict, level: str = "info"):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "details": details,
            "level": level
        }
        
        if level == "error":
            logger.error(json.dumps(log_entry))
        elif level == "warning":
            logger.warning(json.dumps(log_entry))
        else:
            logger.info(json.dumps(log_entry))

    @staticmethod
    def log_github_operation(operation: str, result: dict, user_id: Optional[str] = None):
        GitHubLogger.log_event(
            event_type="github_operation",
            details={
                "operation": operation,
                "result": "success" if result.get("success") else "failed",
                "error": result.get("error"),
                "user_id": user_id
            },
            level="info" if result.get("success") else "error"
        )

    @staticmethod
    def log_security_event(event: str, details: dict):
        GitHubLogger.log_event(
            event_type="security",
            details={"event": event, **details},
            level="warning"
        )


def get_github_service(token: Optional[str] = None) -> GitHubService:
    if not token:
        token = os.getenv("GITHUB_TOKEN")
    
    if not token:
        logger.warning("No GitHub token available")
        
    return GitHubService(token)
