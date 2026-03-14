import { AlertTriangle, ShieldAlert } from 'lucide-react'

interface RiskyUser {
  user_principal_name: string
  risk_level: string
  risk_state: string
  risk_last_updated_date_time: string
  is_processing: boolean
}

interface RiskyUsersData {
  total_risky_users?: number
  risk_levels?: {
    high?: number
    medium?: number
    low?: number
  }
  users?: RiskyUser[]
  error?: string
}

interface RiskyUsersWidgetProps {
  data?: RiskyUsersData
}

function RiskyUsersWidget({ data }: RiskyUsersWidgetProps) {
  const total = data?.total_risky_users || 0
  const high = data?.risk_levels?.high || 0
  const medium = data?.risk_levels?.medium || 0
  const low = data?.risk_levels?.low || 0

  const totalLevels = high + medium + low || 1

  const progress = (value: number) => `${(value / totalLevels) * 100}%`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Utilisateurs à risque</h2>
          <p className="text-xs text-slate-500">Azure Identity Protection</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-rose-600">{total}</p>
          <p className="text-xs text-slate-400">risques actifs</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {[{ label: 'High', value: high, color: 'bg-rose-500' }, { label: 'Medium', value: medium, color: 'bg-amber-500' }, { label: 'Low', value: low, color: 'bg-sky-500' }].map((level) => (
          <div key={level.label}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{level.label}</span>
              <span>{level.value}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`${level.color} h-2 rounded-full`} style={{ width: progress(level.value) }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold text-slate-600 mb-2">Top 3 comptes à risque</h3>
        {data?.users && data.users.length > 0 ? (
          <div className="space-y-2">
            {data.users.slice(0, 3).map((user) => (
              <div key={user.user_principal_name} className="flex items-center justify-between text-xs rounded-md border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.user_principal_name}</p>
                  <p className="text-[11px] text-slate-500">{user.risk_state} — {new Date(user.risk_last_updated_date_time).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-slate-500">{user.risk_level}</span>
                  {user.is_processing && <span className="text-[10px] text-amber-500">Processing</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertTriangle className="w-4 h-4" />
            <span>Aucun compte à risque détecté ou pas d'accès.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default RiskyUsersWidget
