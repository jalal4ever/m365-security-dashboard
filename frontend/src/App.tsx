import { useState, useEffect } from 'react'
import SecureScoreWidget from './components/SecureScoreWidget'
import LicenseWidget from './components/LicenseWidget'
import MfaWidget from './components/MfaWidget'
import DeviceOsWidget from './components/DeviceOsWidget'
import DeviceComplianceWidget from './components/DeviceComplianceWidget'
import RiskyUsersWidget from './components/RiskyUsersWidget'
import UserSecurityAlertsWidget from './components/UserSecurityAlertsWidget'
import Settings from './pages/Settings'
import { Shield, Key, Lock, Settings as SettingsIcon, Building2, ChevronDown, CheckCircle } from 'lucide-react'

interface AzureConfig {
  id?: number
  tenant_id: string
  client_id: string
  tenant_name: string | null
  is_default: boolean
  is_active: boolean
}

interface SecurityData {
  score?: number
  max_score?: number
  percentage?: number
  enabled_standards?: string[]
  licensed?: boolean
}

interface AdminData {
  total_admins?: number
  privileged_admins?: number
  admins?: Array<{
    user_id: string
    user_principal_name: string
    display_name: string
    role_name: string
    is_privileged: boolean
  }>
}

interface LicenseData {
  licenses?: Array<{
    sku_id: string
    sku_part_number: string
    consumed_units: number
    total_licenses: number
    available_licenses: number
  }>
  summary?: {
    total_consumed?: number
    total_available?: number
    total_licenses?: number
  }
}

interface MfaData {
  total_users?: number
  mfa_capable?: number
  capable_percentage?: number
  registered_percentage?: number
  capable_sample?: Array<{
    userPrincipalName: string
    displayName: string
    isMfaCapable: boolean
    methodsRegistered: string[]
  }>
  registered_sample?: Array<{
    userPrincipalName: string
    displayName: string
    isMfaRegistered: boolean
    methodsRegistered: string[]
  }>
  not_capable_sample?: Array<{
    userPrincipalName: string
    displayName: string
    missing: string
  }>
  signins_mfa?: number
  signins_sample?: Array<{
    userPrincipalName: string
    createdDateTime: string
    mfaDetail: Record<string, unknown>
  }>
}

interface RiskyUsersData {
  total_risky_users?: number
  risk_levels?: {
    high?: number
    medium?: number
    low?: number
  }
  users?: Array<{
    user_principal_name: string
    risk_level: string
    risk_state: string
    risk_last_updated_date_time: string
    is_processing?: boolean
  }>
  error?: string
}

interface UserSecurityAlertsData {
  total_alerts: number
  top_users: Array<{
    user_principal_name: string
    score: number
    alert_count: number
    max_severity: string
    recent_alerts: Array<{
      id: string
      title: string
      severity: string
      created_at: string
      status: string
      category: string
      description?: string
    }>
  }>
  error?: string
}

interface DevicesOsData {
  devices?: Array<{
    os: string
    total: number
    versions: Array<{
      version: string
      count: number
    }>
  }>
  total?: number
}

interface ComplianceData {
  summary?: {
    total: number
    compliant: number
    non_compliant: number
    unknown: number
    compliant_percentage: number
    non_compliant_percentage: number
  }
  by_os?: Array<{
    os: string
    total: number
    compliant: number
    non_compliant: number
    compliant_percentage: number
    versions: Array<{
      version: string
      total: number
      compliant: number
      non_compliant: number
      compliant_percentage: number
    }>
  }>
}

interface DashboardData {
  security: SecurityData
  admins: AdminData
  licenses: LicenseData
  mfa: MfaData
  risky?: RiskyUsersData
  userAlerts?: UserSecurityAlertsData
  devicesOs?: DevicesOsData
  compliance?: ComplianceData
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard')
  const [companyName, setCompanyName] = useState<string>('M365 Security Dashboard')
  const [configs, setConfigs] = useState<AzureConfig[]>([])
  const [selectedConfig, setSelectedConfig] = useState<AzureConfig | null>(null)
  const [showTenantMenu, setShowTenantMenu] = useState(false)

  const apiUrl = (import.meta.env.VITE_API_URL?.includes('localhost') || import.meta.env.VITE_API_URL === '') 
    ? '' 
    : import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/azure/configs`)
        const data = await res.json()
        setConfigs(data)
        
        const defaultConfig = data.find((c: AzureConfig) => c.is_default) || data[0]
        if (defaultConfig) {
          setSelectedConfig(defaultConfig)
          setCompanyName(defaultConfig.tenant_name || 'M365 Security Dashboard')
        }
      } catch {
        // Use default name
      }
    }

    const fetchData = async () => {
      try {
        const [securityRes, adminsRes, licensesRes, mfaRes, devicesOsRes, complianceRes, riskyRes, userAlertsRes] = await Promise.all([
          fetch(`${apiUrl}/api/security/score`),
          fetch(`${apiUrl}/api/admins`),
          fetch(`${apiUrl}/api/licenses`),
          fetch(`${apiUrl}/api/mfa`),
          fetch(`${apiUrl}/api/devices-os`),
          fetch(`${apiUrl}/api/devices-compliance`),
          fetch(`${apiUrl}/api/security/risky-users`),
          fetch(`${apiUrl}/api/security/user-alerts`)
        ])

        const [security, admins, licenses, mfa, devicesOs, compliance, risky, userAlerts] = await Promise.all([
          securityRes.json(),
          adminsRes.json(),
          licensesRes.json(),
          mfaRes.json(),
          devicesOsRes.json(),
          complianceRes.json(),
          riskyRes.json(),
          userAlertsRes.json()
        ])

        setData({ security, admins, licenses, mfa, devicesOs, compliance, risky, userAlerts })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchConfigs()
    fetchData()
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [apiUrl])

  const handleSelectTenant = async (config: AzureConfig) => {
    setSelectedConfig(config)
    setCompanyName(config.tenant_name || 'M365 Security Dashboard')
    setShowTenantMenu(false)
    setLoading(true)
    
    if (!config.is_default && config.id) {
      try {
        await fetch(`${apiUrl}/api/azure/default/${config.id}`, { method: 'POST' })
        setConfigs(prev => prev.map(c => ({
          ...c,
          is_default: c.id === config.id
        })))
      } catch {
        // ignore error
      }
    }
    
    try {
      const [securityRes, adminsRes, licensesRes, mfaRes, devicesOsRes, complianceRes, riskyRes, userAlertsRes] = await Promise.all([
        fetch(`${apiUrl}/api/security/score`),
        fetch(`${apiUrl}/api/admins`),
        fetch(`${apiUrl}/api/licenses`),
        fetch(`${apiUrl}/api/mfa`),
        fetch(`${apiUrl}/api/devices-os`),
        fetch(`${apiUrl}/api/devices-compliance`),
        fetch(`${apiUrl}/api/security/risky-users`),
        fetch(`${apiUrl}/api/security/user-alerts`)
      ])

      const [security, admins, licenses, mfa, devicesOs, compliance, risky, userAlerts] = await Promise.all([
        securityRes.json(),
        adminsRes.json(),
        licensesRes.json(),
        mfaRes.json(),
        devicesOsRes.json(),
        complianceRes.json(),
        riskyRes.json(),
        userAlertsRes.json()
      ])

      setData({ security, admins, licenses, mfa, devicesOs, compliance, risky, userAlerts })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Erreur de connexion</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (currentPage === 'settings') {
    return <Settings onBack={() => setCurrentPage('dashboard')} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-9 w-9 text-primary-600" />
            </div>
            <div className="flex items-center gap-3">
              {configs.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowTenantMenu(!showTenantMenu)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-700 font-medium">
                      {selectedConfig?.tenant_name || 'Sélectionner un tenant'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showTenantMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showTenantMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-50 border-b text-xs font-medium text-slate-500">
                        TENANTS CONFIGURÉS
                      </div>
                      {configs.map((config) => (
                        <button
                          key={config.id}
                          onClick={() => handleSelectTenant(config)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                              selectedConfig?.id === config.id ? 'bg-primary-50' : ''
                            }`}
                        >
                          <Building2 className={`h-5 w-5 ${selectedConfig?.id === config.id ? 'text-primary-600' : 'text-slate-400'}`} />
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${selectedConfig?.id === config.id ? 'text-primary-700' : 'text-slate-700'}`}>
                              {config.tenant_name || `Tenant ${config.id}`}
                            </span>
                          </div>
                          {config.is_default && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                              Défaut
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setCurrentPage('settings')}
                className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
                title="Paramètres"
              >
                <SettingsIcon className="h-6 w-6 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900">Vue d'ensemble</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Secure Score</p>
                <p className="text-3xl font-bold text-slate-900">
                  {data?.security?.percentage?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-3 bg-green-100 rounded-xl">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Licences</p>
                <p className="text-3xl font-bold text-slate-900">
                  {data?.licenses?.summary?.total_consumed || 0} <span className="text-slate-400 font-normal text-lg">/ {data?.licenses?.summary?.total_licenses || 0}</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Lock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">MFA Coverage</p>
                <p className="text-3xl font-bold text-slate-900">
                  {data?.mfa?.capable_percentage?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`p-3 rounded-xl ${(data?.compliance?.summary?.compliant_percentage || 0) >= 80 ? 'bg-green-100' : (data?.compliance?.summary?.compliant_percentage || 0) >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
                <CheckCircle className={`h-6 w-6 ${(data?.compliance?.summary?.compliant_percentage || 0) >= 80 ? 'text-green-600' : (data?.compliance?.summary?.compliant_percentage || 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Conformité</p>
                <p className="text-3xl font-bold text-slate-900">
                  {data?.compliance?.summary?.compliant_percentage?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SecureScoreWidget data={data?.security} />
            <LicenseWidget data={data?.licenses} />
            <MfaWidget data={data?.mfa} />
            <DeviceOsWidget data={data?.devicesOs} />
            <DeviceComplianceWidget data={data?.compliance} />
            <UserSecurityAlertsWidget data={data?.userAlerts} />
            <RiskyUsersWidget data={data?.risky} />
          </div>
      </main>
    </div>
  )
}

export default App
