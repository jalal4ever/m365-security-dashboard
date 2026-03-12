interface IntuneComplianceWidgetProps {
  data?: {
    total_devices?: number
    os_breakdown?: Array<{
      os: string
      compliant: number
      non_compliant: number
      total: number
      percentage: number
    }>
    error?: string
    details?: string
  }
}

function IntuneComplianceWidget({ data }: IntuneComplianceWidgetProps) {
  if (data?.error) {
    return (
      <div className="entis-card entis-card-content">
        <p className="text-sm text-[var(--entis-danger)]">
          Données Intune indisponibles: {data.details ?? 'vérifie les autorisations Graph ou la licence Intune'}
        </p>
      </div>
    )
  }

  const total = data?.total_devices || 0
  const breakdown = data?.os_breakdown || []

  return (
    <div className="entis-card entis-card-content space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Conformité des devices</h2>
          <p className="entis-subtitle">Intune Compliance</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Devices détectés</p>
          <p className="text-2xl font-semibold text-slate-900">{total}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {breakdown.map(os => {
          const compliantRatio = os.total ? (os.compliant / os.total) * 100 : 0
          const nonCompliantRatio = os.total ? (os.non_compliant / os.total) * 100 : 0
          return (
            <div key={os.os} className="rounded-3xl border border-[var(--ghost-border)] bg-[rgba(255,255,255,0.65)] p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{os.os}</p>
                  <p className="text-xs text-slate-500">
                    {os.compliant} conformes • {os.non_compliant} non conformes
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{os.percentage}%</span>
              </div>
              <div className="space-y-1">
                <div className="relative h-3 rounded-full border border-[var(--ghost-border)] bg-white overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{ width: `${compliantRatio}%`, background: 'linear-gradient(90deg, var(--entis-secondary), var(--entis-primary))' }}
                  />
                  <div
                    className="absolute inset-y-0 right-0"
                    style={{ width: `${nonCompliantRatio}%`, background: 'linear-gradient(90deg, var(--entis-danger), var(--entis-warm))' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[0.7rem] font-semibold text-slate-600">
                  <span>{os.compliant} conformes</span>
                  <span>{os.non_compliant} non conformes</span>
                </div>
              </div>
            </div>
          )
        })}
        {breakdown.length === 0 && (
          <p className="text-sm text-slate-500">Aucune donnée Intune disponible actuellement.</p>
        )}
      </div>
    </div>
  )
}

export default IntuneComplianceWidget
