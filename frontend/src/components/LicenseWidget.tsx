import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface LicenseWidgetProps {
  data?: {
    licenses?: Array<{
      sku_part_number: string
      consumed_units: number
      total_licenses: number
      available_licenses: number
    }>
    summary?: {
      total_consumed: number
      total_available: number
      total_licenses: number
    }
  }
}

function LicenseWidget({ data }: LicenseWidgetProps) {
  const total = data?.summary?.total_licenses || 0
  const consumed = data?.summary?.total_consumed || 0
  const available = data?.summary?.total_available || 0

  const chartData = {
    labels: ['Utilisées', 'Disponibles'],
    datasets: [{
      data: [consumed, available],
      backgroundColor: ['#3b82f6', '#22c55e'],
      borderWidth: 0
    }]
  }

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false }
    }
  }

  const percentage = total > 0 ? (consumed / total) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Microsoft 365 Business Premium</h2>
      
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-900">
              {consumed}
            </span>
            <span className="text-sm text-slate-500">
              / {total}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">{consumed} utilisées</span>
          <span className="text-slate-600">{available} disponibles</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
          <div 
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-2 text-center">
          {percentage.toFixed(1)}% d'utilisation
        </p>
      </div>
    </div>
  )
}

export default LicenseWidget
