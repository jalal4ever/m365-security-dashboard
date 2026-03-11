interface AdminRolesWidgetProps {
  data?: {
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
}

function AdminRolesWidget({ data }: AdminRolesWidgetProps) {
  const privilegedAdmins = data?.admins?.filter(a => a.is_privileged) || []

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Rôles Administrateurs</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{data?.total_admins || 0}</p>
          <p className="text-sm text-purple-700">Total Admins</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{data?.privileged_admins || 0}</p>
          <p className="text-sm text-red-700">Privilégiés</p>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="text-left p-2">Utilisateur</th>
              <th className="text-left p-2">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {privilegedAdmins.slice(0, 10).map((admin, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{admin.display_name || admin.user_principal_name}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    admin.is_privileged ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {admin.role_name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminRolesWidget
