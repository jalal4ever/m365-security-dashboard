import { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Monitor, Apple, Smartphone, HardDrive, ChevronDown, ChevronRight, Laptop } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface OsVersion {
  version: string
  count: number
  percentage: number
}

interface OsData {
  os: string
  total: number
  versions: OsVersion[]
  proportion: number
}

interface DevicesOsData {
  devices: OsData[]
  total: number
}

interface DeviceOsWidgetProps {
  data?: DevicesOsData
}

const osConfig: Record<string, { color: string; icon: JSX.Element; label: string }> = {
  Windows: { color: '#0078d4', icon: <Monitor className="w-5 h-5" />, label: 'Windows' },
  macOS: { color: '#1d1d1f', icon: <Apple className="w-5 h-5" />, label: 'macOS' },
  iOS: { color: '#007aff', icon: <Smartphone className="w-5 h-5" />, label: 'iOS' },
  Android: { color: '#3ddc84', icon: <Smartphone className="w-5 h-5" />, label: 'Android' },
  Linux: { color: '#e1ad76', icon: <HardDrive className="w-5 h-5" />, label: 'Linux' },
  Unknown: { color: '#94a3b8', icon: <Laptop className="w-5 h-5" />, label: 'Inconnu' }
}

function DeviceOsWidget({ data }: DeviceOsWidgetProps) {
  const [expandedOs, setExpandedOs] = useState<string | null>(null)
  
  const devices = data?.devices || []
  const total = data?.total || 0

  if (total === 0 || devices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Appareils par OS</h2>
        <div className="flex items-center justify-center h-40 text-slate-500">
          Aucune donnée disponible
        </div>
      </div>
    )
  }

  const mainDevices = devices.filter(d => d.os !== 'Unknown')
  const unknownDevice = devices.find(d => d.os === 'Unknown')

  const chartData = {
    labels: mainDevices.map(d => osConfig[d.os]?.label || d.os),
    datasets: [{
      data: mainDevices.map(d => d.total),
      backgroundColor: mainDevices.map(d => osConfig[d.os]?.color || '#94a3b8'),
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
            const os = mainDevices[context.dataIndex]
            const percentage = os.proportion
            return `${os.total} appareils (${percentage}%)`
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
        <h2 className="text-lg font-semibold text-slate-900">Appareils par OS</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-900">{total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mainDevices.map((osData) => {
          const config = osConfig[osData.os] || { color: '#94a3b8', icon: <Laptop className="w-5 h-5" />, label: osData.os }
          const isExpanded = expandedOs === osData.os
          const hasVersions = osData.versions && osData.versions.length > 0

          return (
            <div key={osData.os} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => hasVersions && toggleOs(osData.os)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all ${!hasVersions ? 'cursor-default' : ''}`}
                disabled={!hasVersions}
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
                        width: `${osData.proportion}%`,
                        backgroundColor: config.color
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-lg font-bold text-slate-900">{osData.total}</span>
                    <span className="text-sm text-slate-500">({osData.proportion}%)</span>
                  </div>
                  {hasVersions && (
                    isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" /> : <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                  )}
                </div>
              </button>

              {isExpanded && hasVersions && (
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {osData.versions.slice(0, 6).map((v) => (
                      <div 
                        key={v.version}
                        className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-200"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-700 font-mono">{v.version}</span>
                          <span className="text-xs text-slate-400 ml-1">({v.percentage}%)</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{v.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {unknownDevice && unknownDevice.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-200 text-slate-500">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-600">Inconnu</span>
            </div>
            <span className="text-sm font-semibold text-slate-500">{unknownDevice.total} ({unknownDevice.proportion}%)</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceOsWidget
