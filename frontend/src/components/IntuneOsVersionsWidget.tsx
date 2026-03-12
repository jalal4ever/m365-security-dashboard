import { Apple } from 'lucide-react'
import type { ReactNode } from 'react'


interface IntuneOsVersionsWidgetProps {
  data?: {
    total_devices?: number
    osVersions?: Array<{
      os: string
      total: number
      versions: Array<{
        version: string
        count: number
      }>
    }>
    error?: string
    details?: string
  }
}

const osIcons: Record<string, ReactNode> = {
  Windows: '🪟',
  macOS: <Apple className="text-2xl" />,
  iOS: '📱'
}

const palette = ['#164f4f', '#8dcec1', '#caa37c', '#e1ad76', '#29646c', '#e41712']

function IntuneOsVersionsWidget({ data }: IntuneOsVersionsWidgetProps) {
  if (data?.error) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 font-sans">
        <p className="text-sm text-rose-600">
          Données versions OS indisponibles: {data.details ?? data.error}
        </p>
      </div>
    )
  }

  const total = data?.total_devices || 0
  const osVersions = data?.osVersions || []

  return (
    <div className="entis-card entis-card-content space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Inventaire des systèmes</h2>
          <p className="entis-subtitle">Versions macOS, Windows, iOS</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total devices</p>
          <p className="text-2xl font-semibold text-slate-900">{total}</p>
        </div>
      </div>

      <div className="space-y-5">
        {osVersions.map(osEntry => {
          const ratio = total ? Math.round((osEntry.total / total) * 100) : 0
          const segments = osEntry.versions.map((version, index) => {
            const versionRatio = osEntry.total ? (version.count / osEntry.total) * 100 : 0
            return {
              color: palette[index % palette.length],
              label: version.version,
              count: version.count,
              percent: versionRatio
            }
          })
          return (
            <div key={osEntry.os} className="rounded-3xl border border-[var(--ghost-border)] bg-[rgba(255,255,255,0.7)] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-slate-900">{osIcons[osEntry.os] ?? '🖥️'}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{osEntry.os}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{osEntry.total} appareils</p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-xs text-slate-500">
                  <span>Répartition</span>
                  <span className="text-slate-900 font-semibold">{ratio}% du total</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                {segments.map(segment => (
                  <div key={segment.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-10 rounded-full" style={{ background: segment.color }} />
                      <span className="font-semibold text-slate-900">{segment.label}</span>
                    </div>
                    <span className="text-[0.7rem] text-slate-500">{segment.count} ({segment.percent.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {osVersions.length === 0 && (
          <p className="text-sm text-slate-500">Pas de données sur les versions.</p>
        )}
      </div>
    </div>
  )
}

export default IntuneOsVersionsWidget
