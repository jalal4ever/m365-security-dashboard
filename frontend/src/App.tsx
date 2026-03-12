import { useState, useEffect } from 'react'
import SecureScoreWidget from './components/SecureScoreWidget'
import LicenseWidget from './components/LicenseWidget'
import MfaWidget from './components/MfaWidget'
import Settings from './pages/Settings'
import { Shield, Users, Key, Lock, Settings as SettingsIcon } from 'lucide-react'

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
  mfa_enabled_count?: number
  mfa_disabled_count?: number
  mfa_percentage?: number
  users_with_mfa?: Array<{
    user_id: string
    user_principal_name: string
    display_name: string
    mfa_enabled: boolean
    auth_methods?: string[]
  }>
  users_without_mfa?: Array<{
    user_id: string
    user_principal_name: string
    display_name: string
    mfa_enabled: boolean
  }>
}

interface DashboardData {
  security: SecurityData
  admins: AdminData
  licenses: LicenseData
  mfa: MfaData
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard')

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [securityRes, adminsRes, licensesRes, mfaRes] = await Promise.all([
          fetch(`${apiUrl}/api/security/score`),
          fetch(`${apiUrl}/api/admins`),
          fetch(`${apiUrl}/api/licenses`),
          fetch(`${apiUrl}/api/mfa`)
        ])

        const [security, admins, licenses, mfa] = await Promise.all([
          securityRes.json(),
          adminsRes.json(),
          licensesRes.json(),
          mfaRes.json()
        ])

        setData({ security, admins, licenses, mfa })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [apiUrl])

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
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-slate-900">M365 Security Dashboard</h1>
            </div>
            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2 hover:bg-slate-100 rounded-lg"
              title="Settings"
            >
              <SettingsIcon className="h-6 w-6 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Secure Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data?.security?.percentage?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Administrateurs globaux</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data?.admins?.global_admins ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Key className="h-6 w-6 text-green-600" />
              </div>
            <div>
              <p className="text-sm text-slate-500">Licences</p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.licenses?.summary?.total_consumed || 0} / {data?.licenses?.summary?.total_licenses || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">MFA Coverage</p>
              <p className="text-2xl font-bold text-slate-900">
                {data?.mfa?.mfa_percentage || 0}%
              </p>
            </div>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SecureScoreWidget data={data?.security} />
            <LicenseWidget data={data?.licenses} />
            <MfaWidget data={data?.mfa} />
          </div>
        </main>
    </div>
  )
}

export default App
