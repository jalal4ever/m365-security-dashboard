import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Shield, Eye, EyeOff, CheckCircle, XCircle, Trash2, ArrowLeft, ArrowRight, Star, Plus, Building2, Edit2, LayoutDashboard } from 'lucide-react'

interface AzureConfig {
  id?: number
  tenant_id: string
  client_id: string
  tenant_name: string | null
  is_default: boolean
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

interface Props {
  onBack: () => void
}

export default function Settings({ onBack }: Props) {
  const [configs, setConfigs] = useState<AzureConfig[]>([])
  const [selectedConfig, setSelectedConfig] = useState<AzureConfig | null>(null)
  const [tenantId, setTenantId] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isNew, setIsNew] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || ''

  const loadConfigs = () => {
    fetch(`${apiUrl}/api/azure/configs`)
      .then(res => res.json())
      .then(data => {
        setConfigs(data)
      })
      .finally(() => setLoading(false))
  }

  const selectConfig = async (config: AzureConfig) => {
    setSelectedConfig(config)
    setTenantId(config.tenant_id)
    setClientId(config.client_id)
    setClientSecret('')
    setTenantName(config.tenant_name || '')
    setIsDefault(config.is_default || false)
    setTestPassed(false)
    setIsNew(false)
    setMessage(null)
  }

  useEffect(() => {
    loadConfigs()
  }, [apiUrl])

  const handleSave = async () => {
    if (!tenantId || !clientId || !clientSecret) {
      setMessage({ type: 'error', text: 'Tenant ID, Client ID et Client Secret sont requis' })
      return
    }

    if (!testPassed) {
      setMessage({ type: 'error', text: 'Vous devez passer le test de connexion avant d\'enregistrer' })
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
          client_secret: clientSecret,
          tenant_name: tenantName || `Tenant ${Date.now()}`,
          is_default: isDefault
        })
      })
      const data = await res.json()

      if (data.status === 'success') {
        const name = tenantName || `Application ${Date.now()}`
        setMessage({ type: 'success', text: `${name} enregistrée avec succès` })
        setClientSecret('')
        setTestPassed(false)
        setIsNew(false)
        loadConfigs()
      } else {
        setMessage({ type: 'error', text: data.message || 'Échec de l\'enregistrement' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Échec de la connexion à l\'API' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!tenantId || !clientId || !clientSecret) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis pour tester' })
      return
    }

    setTesting(true)
    setMessage(null)
    setTestPassed(false)

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
        setMessage({ type: 'success', text: 'Connexion Azure réussie !' })
        setTestPassed(true)
      } else {
        setMessage({ type: 'error', text: data.message || 'Échec de la connexion' })
        setTestPassed(false)
      }
    } catch {
      setMessage({ type: 'error', text: 'Échec du test de connexion' })
      setTestPassed(false)
    } finally {
      setTesting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedConfig?.id || !confirm('Êtes-vous sûr de vouloir supprimer cette configuration Azure ?')) return

    try {
      const res = await fetch(`${apiUrl}/api/azure/config/${selectedConfig.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSelectedConfig(null)
        setTenantId('')
        setClientId('')
        setClientSecret('')
        setTenantName('')
        setIsDefault(false)
        setTestPassed(false)
        setMessage({ type: 'success', text: 'Application supprimée avec succès' })
        loadConfigs()
      }
    } catch {
      setMessage({ type: 'error', text: 'Échec de la suppression' })
    }
  }

  const handleSetDefault = async (config: AzureConfig) => {
    if (!config.id) return
    
    try {
      await fetch(`${apiUrl}/api/azure/default/${config.id}`, { method: 'POST' })
      setMessage({ type: 'success', text: `${config.tenant_name || 'Application'} définie par défaut` })
      loadConfigs()
    } catch {
      setMessage({ type: 'error', text: 'Échec de la définition par défaut' })
    }
  }

  const handleNew = () => {
    setSelectedConfig(null)
    setTenantId('')
    setClientId('')
    setClientSecret('')
    setTenantName('')
    setIsDefault(false)
    setTestPassed(false)
    setIsNew(true)
    setMessage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-900 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-primary-900">Security Dashboard</h1>
                  <p className="text-xs text-primary-600 -mt-0.5">Microsoft 365</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-1 ml-8">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-primary-700 hover:bg-accent-100"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-primary-900 text-white"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Paramètres
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Shield className="h-5 w-5 text-primary-700" />
              </div>
              <h2 className="text-xl font-semibold text-primary-900">Applications Azure</h2>
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Nouvelle application
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
              message.type === 'success' ? 'bg-success-light text-success border border-success' : 'bg-danger-light text-danger border border-danger'
            }`}>
              {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {message.text}
            </div>
          )}

          {!selectedConfig && !isNew ? (
            <div>
              {configs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Aucune application configurée</p>
                  <button
                    onClick={handleNew}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Ajouter une application
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {config.tenant_name || `Application ${config.id}`}
                            </h3>
                            {config.is_default && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                Par défaut
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 truncate">
                        {config.tenant_id}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectConfig(config)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-accent-100 text-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setSelectedConfig(config);
                            handleSetDefault(config);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            config.is_default
                              ? 'bg-yellow-100 text-yellow-700 cursor-default'
                              : 'bg-yellow-50 text-yellow-700 hover:bg-alert-yellowLight'
                          }`}
                          disabled={config.is_default}
                          title={config.is_default ? 'Déjà par défaut' : 'Définir par défaut'}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer "${config.tenant_name || 'cette application'}" ?`)) {
                              setSelectedConfig(config);
                              handleDelete();
                            }
                          }}
                          className="px-3 py-2 bg-alert-redLight text-alert-red rounded-lg hover:bg-alert-red hover:text-white"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => { setSelectedConfig(null); setIsNew(false); }}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la liste
              </button>

              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de l'entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Nom de votre entreprise"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50/50 hover:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tenant ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client ID (Application ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder={selectedConfig?.is_active ? "Entrez un nouveau secret pour mettre à jour" : "Votre client secret"}
                  className="w-full px-4 py-2 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-slate-200 rounded focus:ring-primary-500"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Définir par défaut
              </label>
            </div>

            {!testPassed && tenantId && clientId && clientSecret && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Veuillez tester la connexion avant d'enregistrer. Le test est obligatoire.
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !testPassed}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 font-medium"
              title={!testPassed ? 'Vous devez passer le test de connexion avant d\'enregistrer' : ''}
            >
              {saving ? 'Enregistrement...' : isNew ? 'Créer' : 'Mettre à jour'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !tenantId || !clientId || !clientSecret}
              className={`px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200 ${
                testPassed 
                  ? 'bg-primary-700 text-white hover:bg-primary-800' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {testing ? 'Test...' : testPassed ? 'Test réussi' : 'Tester la connexion'}
              {testPassed && <CheckCircle className="h-4 w-4" />}
            </button>
            {selectedConfig?.id && (
              <div className="flex gap-2 ml-auto">
                {!selectedConfig.is_default && (
                  <button
                    onClick={() => handleSetDefault(selectedConfig)}
                    className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 flex items-center gap-2 transition-all duration-200"
                  >
                    <Star className="h-4 w-4" />
                    Par défaut
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-alert-red text-white rounded-lg hover:bg-alert-red flex items-center gap-2 transition-all duration-200 opacity-90 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
          </>
          )}
        </div>

        {configs.length > 0 && !selectedConfig && !isNew && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Permissions Azure requises</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• SecurityEvents.Read.All - Voir le secure score</li>
            <li>• Directory.Read.All - Voir les rôles admin</li>
            <li>• User.Read.All - Voir les utilisateurs et MFA</li>
            <li>• Organization.Read.All - Info organisation</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            Azure Portal → Inscriptions d'applications → Votre App → Permissions API
          </p>
        </div>
        )}
      </main>
    </div>
  )
}
