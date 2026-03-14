import { RefreshCw, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

interface DeviceData {
  total_devices?: number
  compliant_devices?: number
  non_compliant_devices?: number
  compliance_percentage?: number
  by_os?: Array<{
    os: string
    total: number
    compliant: number
    non_compliant: number
    percentage: number
  }>
  by_os_version?: Array<{
    os: string
    total: number
    compliant: number
    non_compliant: number
    percentage: number
  }>
  error?: string
}

interface DeviceComplianceWidgetProps {
  data?: DeviceData
  loading?: boolean
}

const osIcons: Record<string, JSX.Element> = {
  Windows: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M3 5.5L10.5 4.5V11.5H3V5.5ZM3 18.5V12.5H10.5V19.5L3 18.5ZM11.5 4.3L21 3V11.5H11.5V4.3ZM11.5 12.5H21L11.5 20.7V12.5Z"/>
    </svg>
  ),
  macOS: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  iOS: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  Android: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M17.523 15.342c-.776 0-1.406.63-1.406 1.406s.63 1.407 1.406 1.407 1.406-.63 1.406-1.406-.63-1.406-1.406-1.406zm-11.046 0c-.776 0-1.406.63-1.406 1.406s.63 1.407 1.406 1.407 1.406-.63 1.406-1.406-.63-1.406-1.406-1.406zM17.808 9.59l1.696-2.943c.094-.163.039-.37-.124-.464-.163-.094-.37-.038-.463.124l-1.717 2.977-1.695-2.977c-.093-.163-.301-.217-.463-.124-.163.094-.218.301-.124.464l1.696 2.943-1.691 2.943c-.093.163-.039.37.124.463.163.094.37.039.463-.124l1.717-2.977 1.717 2.977c.093.163.301.217.463.124.163-.094.218-.301.124-.464l-1.696-2.943zM23 12.22c0-.814-.394-1.532-1.03-2.04l-1.806-3.133c-.33-.572-.97-.943-1.664-.943h-2.72c-.694 0-1.334.37-1.664.943L7.97 10.18c-.636.508-1.03 1.226-1.03 2.04 0 .814.394 1.532 1.03 2.04l1.806 3.133c.33.572.97.943 1.664.943h2.72c.694 0 1.334-.37 1.664-.943l1.806-3.133c.636-.508 1.03-1.226 1.03-2.04z"/>
    </svg>
  )
}

function DeviceComplianceWidget({ data, loading }: DeviceComplianceWidgetProps) {
  const getComplianceColor = (percentage: number): string => {
    if (percentage <= 70) return '#f78da7'
    if (percentage <= 89) return '#e1ad76'
    return '#164f4f'
  }

  const getComplianceStatus = (percentage: number): { bg: string; text: string } => {
    if (percentage <= 70) return { bg: 'bg-[#f78da7]/10', text: 'text-[#f78da7]' }
    if (percentage <= 89) return { bg: 'bg-[#e1ad76]/10', text: 'text-[#e1ad76]' }
    return { bg: 'bg-brand/10', text: 'text-brand' }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-brand mb-4">Conformité par OS</h2>
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-text-muted">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-brand mb-4">Conformité par OS</h2>
        <p className="text-text-muted">{data?.error || 'Aucune donnée disponible'}</p>
      </div>
    )
  }

  const osList = data.by_os || []

  const getComplianceBarColor = (percentage: number): string => {
    if (percentage <= 70) return '#f78da7'
    if (percentage <= 89) return '#e1ad76'
    return '#164f4f'
  }

  const getComplianceIcon = (percentage: number) => {
    if (percentage >= 90) return <ShieldCheck className="w-5 h-5" />
    if (percentage >= 70) return <ShieldAlert className="w-5 h-5" />
    return <ShieldX className="w-5 h-5" />
  }

  const getOsIcon = (osName: string) => {
    const key = Object.keys(osIcons).find(k => osName.toLowerCase().includes(k.toLowerCase()))
    return key ? osIcons[key] : null
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-brand">Conformité par OS</h2>
          <p className="text-sm text-accent">État de conformité des appareils</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getComplianceStatus(data.compliance_percentage || 0).bg}`}>
          <span style={{ color: getComplianceColor(data.compliance_percentage || 0) }}>
            {getComplianceIcon(data.compliance_percentage || 0)}
          </span>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-alt rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand">{data.total_devices || 0}</p>
          <p className="text-xs text-accent">Total</p>
        </div>
        <div className="bg-brand/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: getComplianceColor(data.compliance_percentage || 0) }}>{data.compliant_devices || 0}</p>
          <p className="text-xs" style={{ color: getComplianceColor(data.compliance_percentage || 0) }}>Conformes</p>
        </div>
        <div className="bg-[#f78da7]/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#f78da7]">{data.non_compliant_devices || 0}</p>
          <p className="text-xs text-[#f78da7]">Non Conformes</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand">Taux de conformité global</span>
          <span className="text-xl font-bold" style={{ color: getComplianceColor(data.compliance_percentage || 0) }}>
            {data.compliance_percentage?.toFixed(1) || 0}%
          </span>
        </div>
        <div className="w-full bg-surface-alt rounded-full h-3">
          <div 
            className="h-3 rounded-full transition-all"
            style={{ width: `${data.compliance_percentage || 0}%`, backgroundColor: getComplianceBarColor(data.compliance_percentage || 0) }}
          />
        </div>
      </div>

      {/* OS Breakdown */}
      {osList.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-brand mb-4">Par système d'exploitation</h3>
          <div className="space-y-3">
            {osList.map((os, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                      {getOsIcon(os.os)}
                    </div>
                    <span className="font-semibold text-brand">{os.os}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${
                      os.percentage >= 90 ? 'text-success' : 
                      os.percentage >= 70 ? 'text-warning' : 'text-danger'
                    }`}>
                      {os.percentage}%
                    </span>
                    <span className="text-xs text-text-muted">({os.compliant}/{os.total})</span>
                  </div>
                </div>
                <div className="w-full bg-surface-alt rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getComplianceColor(os.percentage)}`}
                    style={{ width: `${os.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviceComplianceWidget
