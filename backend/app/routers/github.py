from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from services.github_service import get_github_service, GitHubLogger
from services.logging_service import log_service

router = APIRouter(prefix="/api/github", tags=["GitHub Integration"])


def verify_authorization(x_github_token: Optional[str] = Header(None)) -> str:
    if not x_github_token:
        raise HTTPException(status_code=401, detail="GitHub token required")
    return x_github_token


class CreateRepoRequest(BaseModel):
    name: str
    description: str = ""
    private: bool = False


class CreatePRRequest(BaseModel):
    owner: str
    repo: str
    title: str
    body: str
    head: str
    base: str = "main"


@router.get("/status")
def get_status(x_github_token: str = Header(None)):
    token = x_github_token
    if not token:
        token_status = "not_configured"
    else:
        token_status = "configured"
    
    return {
        "status": token_status,
        "message": "GitHub integration ready" if token else "GitHub token required in header"
    }


@router.get("/user")
def get_user(x_github_token: str = Header(None)):
    token = verify_authorization(x_github_token)
    github = get_github_service(token)
    
    result = github.get_current_user()
    
    if "error" in result:
        GitHubLogger.log_github_operation("get_user", result)
        raise HTTPException(status_code=400, detail=result["error"])
    
    GitHubLogger.log_github_operation("get_user", result)
    return result["data"]


@router.get("/repos")
def list_repos(x_github_token: str = Header(None)):
    token = verify_authorization(x_github_token)
    github = get_github_service(token)
    
    result = github.list_repos()
    
    if "error" in result:
        GitHubLogger.log_github_operation("list_repos", result)
        raise HTTPException(status_code=400, detail=result["error"])
    
    GitHubLogger.log_github_operation("list_repos", result)
    repos = result["data"]
    return [{"name": r["name"], "full_name": r["full_name"], "private": r["private"], "url": r["html_url"]} for r in repos]


@router.post("/repos")
def create_repo(req: CreateRepoRequest, x_github_token: str = Header(None)):
    token = verify_authorization(x_github_token)
    github = get_github_service(token)
    
    log_service.info(f"Creating repository: {req.name}")
    result = github.create_repo(req.name, req.description, req.private)
    
    if "error" in result:
        GitHubLogger.log_github_operation("create_repo", result)
        raise HTTPException(status_code=400, detail=result["error"])
    
    GitHubLogger.log_github_operation("create_repo", result)
    return result["data"]


@router.post("/repos/{owner}/{repo}/pulls")
def create_pull_request(
    owner: str,
    repo: str,
    req: CreatePRRequest,
    x_github_token: str = Header(None)
):
    token = verify_authorization(x_github_token)
    github = get_github_service(token)
    
    log_service.info(f"Creating PR in {owner}/{repo}")
    result = github.create_pull_request(owner, repo, req.title, req.body, req.head, req.base)
    
    if "error" in result:
        GitHubLogger.log_github_operation("create_pull_request", result)
        raise HTTPException(status_code=400, detail=result["error"])
    
    GitHubLogger.log_github_operation("create_pull_request", result)
    return result["data"]


@router.get("/repos/{owner}/{repo}/pulls")
def list_pull_requests(
    owner: str,
    repo: str,
    state: str = "open",
    x_github_token: str = Header(None)
):
    token = verify_authorization(x_github_token)
    github = get_github_service(token)
    
    result = github.list_pulls(owner, repo, state)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    pulls = result["data"]
    return [{"number": p["number"], "title": p["title"], "state": p["state"], "url": p["html_url"]} for p in pulls]


@router.get("/repos/{owner}/{repo}/actions")
def get_workflow_runs(
    owner: str,
    repo: str,
    x_github_token: str = Header(None)
):
    token = verify_authorization(x_github_token)
    github = get_github_service(token)
    
    result = github.get_workflow_runs(owner, repo)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    runs = result["data"]["workflow_runs"][:10]
    return [{
        "id": r["id"],
        "name": r["name"],
        "status": r["status"],
        "conclusion": r.get("conclusion"),
        "branch": r["head_branch"],
        "url": r["html_url"],
        "created_at": r["created_at"]
    } for r in runs]
