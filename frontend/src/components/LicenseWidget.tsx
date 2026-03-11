import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

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
  const licenses = data?.licenses?.slice(0, 6) || []

  const chartData = {
    labels: licenses.map(l => l.sku_part_number),
    datasets: [
      {
        label: 'Utilisées',
        data: licenses.map(l => l.consumed_units),
        backgroundColor: '#3b82f6'
      },
      {
        label: 'Disponibles',
        data: licenses.map(l => l.available_licenses),
        backgroundColor: '#22c55e'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Utilisation des Licences</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">
            {data?.summary?.total_consumed || 0} utilisées
          </span>
          <span className="text-slate-600">
            {data?.summary?.total_licenses || 0} totales
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-full"
            style={{
              width: `${((data?.summary?.total_consumed || 0) / (data?.summary?.total_licenses || 1)) * 100}%`
            }}
          />
        </div>
      </div>

      {licenses.length > 0 && (
        <Bar data={chartData} options={options} />
      )}
    </div>
  )
}

export default LicenseWidget
