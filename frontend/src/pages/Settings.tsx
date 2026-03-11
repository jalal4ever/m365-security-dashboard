import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Shield, Eye, EyeOff, CheckCircle, XCircle, Trash2, ArrowLeft, Github } from 'lucide-react'
import GitHubIntegration from './GitHubIntegration'

interface AzureConfig {
  tenant_id: string
  client_id: string
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

interface Props {
  onBack: () => void
}

export default function Settings({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'azure' | 'github'>('azure')
  const [config, setConfig] = useState<AzureConfig | null>(null)
  const [tenantId, setTenantId] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${apiUrl}/api/azure/config`)
      .then(res => res.json())
      .then(data => {
        if (data && data.tenant_id) {
          setConfig(data)
          setTenantId(data.tenant_id)
          setClientId(data.client_id)
        }
      })
      .finally(() => setLoading(false))
  }, [apiUrl])

  const handleSave = async () => {
    if (!tenantId || !clientId || !clientSecret) {
      setMessage({ type: 'error', text: 'All fields are required' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`${apiUrl}/api/azure/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          client_id: clientId,
          client_secret: clientSecret
        })
      })
      const data = await res.json()

      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'Configuration saved securely' })
        setClientSecret('')
        setConfig(prev => prev ? { ...prev, tenant_id: tenantId, client_id: clientId } : null)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to connect to API' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!tenantId || !clientId || !clientSecret) {
      setMessage({ type: 'error', text: 'All fields are required to test' })
      return
    }

    setTesting(true)
    setMessage(null)

    try {
      const res = await fetch(`${apiUrl}/api/azure/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          client_id: clientId,
          client_secret: clientSecret
        })
      })
      const data = await res.json()

      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'Azure connection successful!' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Connection failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to test connection' })
    } finally {
      setTesting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the Azure configuration?')) return

    try {
      const res = await fetch(`${apiUrl}/api/azure/config`, { method: 'DELETE' })
      if (res.ok) {
        setConfig(null)
        setTenantId('')
        setClientId('')
        setClientSecret('')
        setMessage({ type: 'success', text: 'Configuration deleted' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete configuration' })
    }
  }

  if (activeTab === 'github') {
    return <GitHubIntegration onBack={() => setActiveTab('azure')} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <SettingsIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>
        
        <div className="flex gap-4 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('azure')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'azure'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Azure
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'github'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Github className="h-4 w-4 inline mr-2" />
            GitHub
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Microsoft Azure App Registration</h2>
            {config?.is_active && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> Connected
              </span>
            )}
          </div>

          <p className="text-slate-600 mb-6 text-sm">
            Enter your Azure App Registration credentials to enable the dashboard.
            Your credentials are encrypted before storage.
          </p>

          {message && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tenant ID
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client ID (Application ID)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder={config?.is_active ? "Enter new secret to update" : "Your client secret"}
                  className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !tenantId || !clientId || !clientSecret}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            {config?.is_active && (
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Required Azure Permissions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• SecurityEvents.Read.All - View secure score</li>
            <li>• Directory.Read.All - View admin roles</li>
            <li>• User.Read.All - View users and MFA status</li>
            <li>• Organization.Read.All - Organization info</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            Go to Azure Portal → App Registrations → Your App → API Permissions
          </p>
        </div>
      </main>
    </div>
  )
}
