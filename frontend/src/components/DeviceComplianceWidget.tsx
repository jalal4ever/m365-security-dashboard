import { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Monitor, Apple, Smartphone, ChevronDown, ChevronRight, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ComplianceVersion {
  version: string
  total: number
  compliant: number
  non_compliant: number
  compliant_percentage: number
}

interface OsCompliance {
  os: string
  total: number
  compliant: number
  non_compliant: number
  compliant_percentage: number
  versions: ComplianceVersion[]
}

interface ComplianceSummary {
  total: number
  compliant: number
  non_compliant: number
  unknown: number
  compliant_percentage: number
  non_compliant_percentage: number
}

interface ComplianceData {
  summary: ComplianceSummary
  by_os: OsCompliance[]
}

interface DeviceComplianceWidgetProps {
  data?: ComplianceData
}

const osConfig: Record<string, { color: string; icon: JSX.Element; label: string }> = {
  Windows: { color: '#0078d4', icon: <Monitor className="w-5 h-5" />, label: 'Windows' },
  macOS: { color: '#1d1d1f', icon: <Apple className="w-5 h-5" />, label: 'macOS' },
  iOS: { color: '#007aff', icon: <Smartphone className="w-5 h-5" />, label: 'iOS' },
  Android: { color: '#3ddc84', icon: <Smartphone className="w-5 h-5" />, label: 'Android' },
  Unknown: { color: '#94a3b8', icon: <Monitor className="w-5 h-5" />, label: 'Inconnu' }
}

function DeviceComplianceWidget({ data }: DeviceComplianceWidgetProps) {
  const [expandedOs, setExpandedOs] = useState<string | null>(null)
  
  const summary = data?.summary
  const byOs = data?.by_os || []

  if (!summary || summary.total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Conformité des appareils</h2>
        <div className="flex items-center justify-center h-40 text-slate-500">
          Aucune donnée disponible
        </div>
      </div>
    )
  }

  const chartData = {
    labels: ['Conforme', 'Non conforme', 'Inconnu'],
    datasets: [{
      data: [summary.compliant, summary.non_compliant, summary.unknown],
      backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  }

  const chartOptions = {
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            const percentage = ((value / summary.total) * 100).toFixed(1)
            return `${value} appareils (${percentage}%)`
          }
        }
      }
    }
  }

  const toggleOs = (os: string) => {
    setExpandedOs(expandedOs === os ? null : os)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Conformité des appareils</h2>
        <div className="relative w-20 h-20">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{summary.compliant_percentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-around mb-6 py-4 bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{summary.compliant}</span>
          </div>
          <span className="text-sm text-slate-500">Conformes</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-red-600">{summary.non_compliant}</span>
          </div>
          <span className="text-sm text-slate-500">Non conformes</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span className="text-2xl font-bold text-slate-500">{summary.unknown}</span>
          </div>
          <span className="text-sm text-slate-500">Inconnus</span>
        </div>
      </div>

      <div className="space-y-3">
        {byOs.map((osData) => {
          const config = osConfig[osData.os] || { color: '#94a3b8', icon: <Monitor className="w-5 h-5" />, label: osData.os }
          const isExpanded = expandedOs === osData.os

          return (
            <div key={osData.os} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleOs(osData.os)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  {config.icon}
                </div>
                
                <div className="flex-1 text-left">
                  <span className="font-semibold text-slate-900">{config.label}</span>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5">
                    <div 
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${osData.compliant_percentage}%`,
                        backgroundColor: osData.compliant_percentage >= 80 ? '#22c55e' : osData.compliant_percentage >= 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 justify-end">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-slate-900">{osData.compliant}</span>
                    <XCircle className="w-4 h-4 text-red-500 ml-2" />
                    <span className="text-sm font-semibold text-slate-900">{osData.non_compliant}</span>
                  </div>
                  <span className="text-xs text-slate-500">{osData.compliant_percentage}% conforme</span>
                </div>
                
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {isExpanded && osData.versions.length > 0 && (
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {osData.versions.slice(0, 6).map((v) => (
                      <div 
                        key={v.version}
                        className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-200"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-700 font-mono">{v.version}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">{v.compliant}</span>
                            <XCircle className="w-3 h-3 text-red-500 ml-1" />
                            <span className="text-xs text-red-600">{v.non_compliant}</span>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${v.compliant_percentage >= 80 ? 'text-green-600' : v.compliant_percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {v.compliant_percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DeviceComplianceWidget
