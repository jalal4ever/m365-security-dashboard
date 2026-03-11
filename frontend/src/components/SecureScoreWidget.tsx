import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface SecureScoreWidgetProps {
  data?: {
    score?: number
    max_score?: number
    percentage?: number
    enabled_standards?: string[]
    licensed?: boolean
  }
}

function SecureScoreWidget({ data }: SecureScoreWidgetProps) {
  const chartData = {
    labels: ['Score actuel', 'Points restants'],
    datasets: [{
      data: [data?.score || 0, (data?.max_score || 0) - (data?.score || 0)],
      backgroundColor: ['#3b82f6', '#e2e8f0'],
      borderWidth: 0
    }]
  }

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Microsoft Secure Score</h2>
      
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-900">
              {data?.percentage?.toFixed(1) || '0'}%
            </span>
            <span className="text-sm text-slate-500">
              {data?.score || 0} / {data?.max_score || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-slate-500">
          <span className="font-medium">Standards actifs:</span>{' '}
          {data?.enabled_standards?.join(', ') || 'Aucun'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-medium">Licencié:</span>{' '}
          {data?.licensed ? 'Oui' : 'Non'}
        </p>
      </div>
    </div>
  )
}

export default SecureScoreWidget
