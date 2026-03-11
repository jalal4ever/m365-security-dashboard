import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface MfaWidgetProps {
  data?: {
    total_users?: number
    mfa_enabled_count?: number
    mfa_disabled_count?: number
    mfa_percentage?: number
    users_without_mfa?: Array<{
      user_principal_name: string
      display_name: string
    }>
  }
}

function MfaWidget({ data }: MfaWidgetProps) {
  const chartData = {
    labels: ['MFA Activé', 'MFA Désactivé'],
    datasets: [{
      data: [data?.mfa_enabled_count || 0, data?.mfa_disabled_count || 0],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 0
    }]
  }

  const options = {
    plugins: {
      legend: { position: 'bottom' as const }
    }
  }

  const usersWithoutMfa = data?.users_without_mfa || []

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Couverture MFA</h2>
      
      <div className="flex items-center justify-center mb-4">
        <div className="w-40 h-40">
          <Pie data={chartData} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">{data?.mfa_enabled_count || 0}</p>
          <p className="text-sm text-slate-500">MFA Activé</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600">{data?.mfa_disabled_count || 0}</p>
          <p className="text-sm text-slate-500">MFA Désactivé</p>
        </div>
      </div>

      {usersWithoutMfa.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-sm text-slate-700 mb-2">
            Utilisateurs sans MFA ({usersWithoutMfa.length})
          </h3>
          <div className="max-h-32 overflow-y-auto">
            {usersWithoutMfa.slice(0, 5).map((user, idx) => (
              <div key={idx} className="text-sm py-1 border-b last:border-0">
                <span className="text-red-600">{user.display_name || user.user_principal_name}</span>
              </div>
            ))}
            {usersWithoutMfa.length > 5 && (
              <p className="text-sm text-slate-500 mt-2">
                +{usersWithoutMfa.length - 5} autres utilisateurs
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MfaWidget
