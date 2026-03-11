import { useState, useEffect } from 'react'
import { Github, GitPullRequest, Play, CheckCircle, XCircle, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react'

interface Props {
  onBack: () => void
}

interface Repo {
  name: string
  full_name: string
  private: boolean
  url: string
}

interface PullRequest {
  number: number
  title: string
  state: string
  url: string
}

interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  branch: string
  url: string
  created_at: string
}

export default function GitHubIntegration({ onBack }: Props) {
  const [token, setToken] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const checkStatus = async () => {
    const res = await fetch(`${apiUrl}/api/github/status`)
    const data = await res.json()
    setIsConfigured(data.status === 'configured')
  }

  const fetchData = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const [reposRes, pullsRes, runsRes] = await Promise.all([
        fetch(`${apiUrl}/api/github/repos`, { headers: { 'X-GitHub-Token': token } }),
        fetch(`${apiUrl}/api/github/repos/jalal4ever/m365-security-dashboard/pulls`, { headers: { 'X-GitHub-Token': token } }),
        fetch(`${apiUrl}/api/github/repos/jalal4ever/m365-security-dashboard/actions`, { headers: { 'X-GitHub-Token': token } })
      ])

      if (reposRes.ok) setRepos(await reposRes.json())
      if (pullsRes.ok) setPullRequests(await pullsRes.json())
      if (runsRes.ok) setWorkflowRuns(await runsRes.json())
      
      setMessage({ type: 'success', text: 'Data fetched successfully' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch GitHub data' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToken = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Token is required' })
      return
    }

    localStorage.setItem('github_token', token)
    setIsConfigured(true)
    setMessage({ type: 'success', text: 'Token saved securely' })
    fetchData()
  }

  const handleTestConnection = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Token required' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/github/user`, {
        headers: { 'X-GitHub-Token': token }
      })
      
      if (res.ok) {
        const user = await res.json()
        setMessage({ type: 'success', text: `Connected as ${user.login}` })
      } else {
        setMessage({ type: 'error', text: 'Invalid token or insufficient permissions' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection failed' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const savedToken = localStorage.getItem('github_token')
    if (savedToken) {
      setToken(savedToken)
      setIsConfigured(true)
      fetchData()
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <Github className="h-8 w-8 text-slate-900" />
            <h1 className="text-2xl font-bold text-slate-900">GitHub Integration</h1>
            {isConfigured && <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Security Warning
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Your GitHub Personal Access Token is stored locally in your browser. 
            Never share this token. Use a token with minimal permissions (repo scope only).
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSaveToken}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Token
            </button>
            <button
              onClick={handleTestConnection}
              disabled={loading || !token}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </div>

        {isConfigured && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repositories
                </h3>
                {repos.length === 0 ? (
                  <p className="text-slate-500">No repositories found</p>
                ) : (
                  <ul className="space-y-2">
                    {repos.slice(0, 5).map(repo => (
                      <li key={repo.name} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="font-medium">{repo.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${repo.private ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {repo.private ? 'Private' : 'Public'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5" />
                  Pull Requests
                </h3>
                {pullRequests.length === 0 ? (
                  <p className="text-slate-500">No open pull requests</p>
                ) : (
                  <ul className="space-y-2">
                    {pullRequests.slice(0, 5).map(pr => (
                      <li key={pr.number} className="p-2 bg-slate-50 rounded">
                        <span className="font-medium">#{pr.number}</span> {pr.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Recent Workflow Runs
              </h3>
              {workflowRuns.length === 0 ? (
                <p className="text-slate-500">No workflow runs found</p>
              ) : (
                <ul className="space-y-2">
                  {workflowRuns.map(run => (
                    <li key={run.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div>
                        <span className="font-medium">{run.name}</span>
                        <span className="text-sm text-slate-500 ml-2">({run.branch})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          run.conclusion === 'success' ? 'bg-green-100 text-green-700' :
                          run.conclusion === 'failure' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {run.conclusion || run.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <button
                onClick={fetchData}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
