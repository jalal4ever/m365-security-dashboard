import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, ShieldInfo, Shield } from 'lucide-react'

interface SecurityAlert {
  id: string
  title: string
  severity: string
  created_at: string
  status: string
  category: string
  description?: string
}

interface UserSecurityAlerts {
  user_principal_name: string
  score: number
  alert_count: number
  max_severity: string
  recent_alerts: SecurityAlert[]
}

interface UserSecurityAlertsData {
  total_alerts: number
  top_users: UserSecurityAlerts[]
  error?: string
}

interface UserSecurityAlertsWidgetProps {
  data?: UserSecurityAlertsData
}

const severityConfig: Record<string, { color: string; bg: string; icon: any }> = {
  high: { color: 'text-rose-600', bg: 'bg-rose-50', icon: ShieldAlert },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
  low: { color: 'text-blue-600', bg: 'bg-blue-50', icon: ShieldInfo },
  informational: { color: 'text-slate-600', bg: 'bg-slate-50', icon: Shield },
}

function UserSecurityAlertsWidget({ data }: UserSecurityAlertsWidgetProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  
  const topUsers = data?.top_users || []
  const error = data?.error

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Alertes de sécurité</h2>
        <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Top 10 Utilisateurs ciblés</h2>
          <p className="text-xs text-slate-500">Basé sur les alertes Microsoft Defender</p>
        </div>
        <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
          {data?.total_alerts || 0} alertes actives
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {topUsers.length > 0 ? (
          topUsers.map((user) => {
            const isExpanded = expandedUser === user.user_principal_name
            const severity = severityConfig[user.max_severity.toLowerCase()] || severityConfig.low
            
            return (
              <div key={user.user_principal_name} className="flex flex-col">
                <button 
                  onClick={() => setExpandedUser(isExpanded ? null : user.user_principal_name)}
                  className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left ${isExpanded ? 'bg-slate-50/50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${severity.bg}`}>
                      <severity.icon className={`h-5 w-5 ${severity.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.user_principal_name}</p>
                      <p className="text-xs text-slate-500">{user.alert_count} alertes détectées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${severity.bg} ${severity.color}`}>
                      {user.max_severity}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 bg-slate-50/50 border-t border-slate-100/50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Dernières alertes</p>
                    <div className="space-y-1.5">
                      {user.recent_alerts.map((alert) => {
                        const alertSev = severityConfig[alert.severity.toLowerCase()] || severityConfig.low
                        return (
                          <div key={alert.id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex items-start gap-3">
                             <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${alertSev.color.replace('text-', 'bg-')}`} />
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start gap-2">
                                 <p className="text-xs font-medium text-slate-900 truncate">{alert.title}</p>
                                 <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                   {new Date(alert.created_at).toLocaleDateString()}
                                 </span>
                               </div>
                               <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">{alert.description || 'Pas de description'}</p>
                             </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center">
            <Shield className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Aucune alerte critique détectée récemment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSecurityAlertsWidget
