import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface MfaWidgetProps {
  data?: {
    total_users?: number
    mfa_capable?: number
    capable_percentage?: number
    registered_percentage?: number
    not_capable_sample?: Array<{
      userPrincipalName: string
      displayName: string
      missing: string
    }>
  }
}

function MfaWidget({ data }: MfaWidgetProps) {
  const total = data?.total_users || 0
  const capable = data?.mfa_capable || 0
  const notCapable = Math.max(total - capable, 0)
  const chartData = {
    labels: ['MFA Activé', 'MFA Désactivé'],
    datasets: [{
      data: [capable, notCapable],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 0
    }]
  }

  const options = {
    plugins: {
      legend: { position: 'bottom' as const }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Couverture MFA</h2>
      
      <div className="flex items-center justify-center mb-4">
        <div className="w-40 h-40">
          <Pie data={chartData} options={options} />
        </div>
      </div>

      {data?.capable_percentage !== undefined && (
        <p className="text-center text-xs text-slate-500 mb-3">
          {data.capable_percentage.toFixed(1)}% des comptes sont MFA capable — {data.registered_percentage?.toFixed(1) || '0.0'}% ont enregistré au moins une méthode
        </p>
      )}
      {data?.signins_mfa !== undefined && (
        <p className="text-center text-xs text-slate-500 mb-3">
          {data.signins_mfa} utilisateurs ont déclenché un MFA via une session récente (logs CA)
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{capable}</p>
            <p className="text-sm text-slate-500">MFA Activé</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{notCapable}</p>
            <p className="text-sm text-slate-500">MFA Désactivé</p>
          </div>
        </div>

      {(data?.not_capable_sample?.length || 0) > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-sm text-slate-700 mb-2">
            Utilisateurs sans MFA ({notCapable})
          </h3>
          <div className="max-h-32 overflow-y-auto">
            {data?.not_capable_sample?.slice(0, 5).map((user, idx) => (
              <div key={idx} className="text-sm py-1 border-b last:border-0">
                <span className="text-red-600">{user.displayName || user.userPrincipalName}</span>
              </div>
            ))}
            {notCapable > 5 && (
              <p className="text-sm text-slate-500 mt-2">
                +{notCapable - 5} autres comptes
              </p>
            )}
          </div>
        </div>
      )}
      {data?.signins_sample && data.signins_sample.length > 0 && (
        <div className="border-t pt-4 mt-3">
          <h3 className="text-xs text-slate-500 mb-2">Exemples de sessions MFA récentes</h3>
          <div className="grid gap-2 text-xs">
            {data.signins_sample.map((entry, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{entry.userPrincipalName}</span>
                <span className="text-slate-400">{new Date(entry.createdDateTime).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MfaWidget
