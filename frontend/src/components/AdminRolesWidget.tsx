import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp, Users } from 'lucide-react'

interface AdminRolesWidgetProps {
  data?: {
    total_admins?: number
    privileged_admins?: number
    global_admins?: number
    admins?: Array<{
      user_id: string
      user_principal_name: string
      display_name: string
      role_name: string
      is_privileged: boolean
    }>
  }
}

const ROLE_ORDER = [
  "Global Administrator",
  "Privileged Role Administrator",
  "Exchange Administrator",
  "SharePoint Administrator",
  "User Administrator",
  "Security Administrator",
  "Helpdesk Administrator",
  "Billing Administrator",
  "Password Administrator",
  "Directory Readers",
  "Device Administrators",
  "Application Administrator",
  "Cloud Application Administrator",
  "Desktop Analytics Administrator",
  "Intune Administrator",
  "Power BI Administrator",
  "Teams Administrator",
  "Teams Communications Administrator",
  "Skype for Business Administrator",
  "Power Platform Administrator",
  "Dynamics 365 Administrator",
  "Commerce Administrator",
  "Customer Lockbox Administrator",
  "Azure AD Joined Device Local Admin",
  "Device Join",
  "Device Management",
  "Enrolled",
  "Enrolled without Policy",
  "External ID User Flow",
  "External ID User Flow Attribute",
  "External ID User Flow Identity Provider",
  "Partner Tier1 Support",
  "Partner Tier2 Support",
  "Private Channel Member",
  "Profile",
  "Report Reader",
  "Search Admin",
  "Search Editor",
  "Security Operator",
  "Global Reader",
  "Compliance Administrator",
  "Conditional Access Administrator",
  "Cloud App Security Administrator",
  "Application Proxy Service Connector",
  "Domain Name Administrator",
  "Guest Inviter",
  "License Administrator",
  "Office Apps Admin",
  "Privileged Authentication Administrator",
  "Service Support Admin",
  "Sync Agent",
  "Teamwork Admin",
  "Usage Summary Reports Reader",
  "User Administrator"
]

const ROLE_MAX_RECOMMENDED: Record<string, number> = {
  "Global Administrator": 4,
  "Privileged Role Administrator": 2,
  "Exchange Administrator": 2,
  "SharePoint Administrator": 2,
  "User Administrator": 5,
  "Security Administrator": 5,
  "Helpdesk Administrator": 5,
  "Billing Administrator": 2,
}

function AdminRolesWidget({ data }: AdminRolesWidgetProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const admins = data?.admins || []
  
  const roleGroups = admins.reduce((acc, admin) => {
    const role = admin.role_name || "Unknown"
    if (!acc[role]) {
      acc[role] = []
    }
    acc[role].push(admin)
    return acc
  }, {} as Record<string, typeof admins>)

  const sortedRoles = Object.keys(roleGroups).sort((a, b) => {
    const indexA = ROLE_ORDER.indexOf(a)
    const indexB = ROLE_ORDER.indexOf(b)
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.localeCompare(b)
  })

  const displayedRoles = showAll ? sortedRoles : sortedRoles.slice(0, 5)
  const totalRoles = sortedRoles.length

  const isOverLimit = (role: string, count: number) => {
    const max = ROLE_MAX_RECOMMENDED[role]
    return max && count > max
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-5 border-b border-secondary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary-100 rounded-lg">
              <Shield className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary-900">Rôles Administrateurs</h2>
              <p className="text-xs text-primary-500">{totalRoles} rôles • {data?.total_admins || 0} comptes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center px-3 py-1.5 bg-secondary-100 rounded-lg">
              <p className="text-xl font-bold text-primary-700">{data?.global_admins || 0}</p>
              <p className="text-[10px] text-primary-600 font-medium">Global</p>
            </div>
            <div className="text-center px-3 py-1.5 bg-danger-light rounded-lg">
              <p className="text-xl font-bold text-danger">{data?.privileged_admins || 0}</p>
              <p className="text-[10px] text-danger font-medium">Privilège</p>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-secondary-50">
        {displayedRoles.map((role) => {
          const users = roleGroups[role]
          const maxRecommended = ROLE_MAX_RECOMMENDED[role]
          const isOver = isOverLimit(role, users.length)
          const isExpanded = expandedRole === role

          return (
            <div key={role}>
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${isOver ? 'bg-gold-500' : 'bg-slate-300'}`} />
                  <span className="text-sm font-medium text-slate-700">{role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isOver 
                      ? 'bg-gold-50 text-gold-600 font-medium' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {users.length} {maxRecommended ? `/ ${maxRecommended}` : ''}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100/50">
                  <div className="space-y-1.5">
                    {users.map((user, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-sm">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {user.display_name || user.user_principal_name.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{user.user_principal_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {totalRoles > 5 && (
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showAll ? 'Afficher moins' : `Afficher les ${totalRoles - 5} autres rôles`}
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminRolesWidget
