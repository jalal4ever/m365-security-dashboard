import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface OsVersionData {
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
}

interface OsDistributionWidgetProps {
  data?: OsVersionData
  loading?: boolean
}

const osColors: Record<string, string> = {
  Windows: '#164f4f',
  macOS: '#1e293b',
  iOS: '#8dcec1',
  Android: '#00a67e',
  Linux: '#e1ad76'
}

const osIcons: Record<string, JSX.Element> = {
  Windows: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M3 5.5L10.5 4.5V11.5H3V5.5ZM3 18.5V12.5H10.5V19.5L3 18.5ZM11.5 4.3L21 3V11.5H11.5V4.3ZM11.5 12.5H21L11.5 20.7V12.5Z"/>
    </svg>
  ),
  macOS: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  iOS: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  Android: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M17.523 15.342c-.776 0-1.406.63-1.406 1.406s.63 1.407 1.406 1.407 1.406-.63 1.406-1.406-.63-1.406-1.406-1.406zm-11.046 0c-.776 0-1.406.63-1.406 1.406s.63 1.407 1.406 1.407 1.406-.63 1.406-1.406-.63-1.406-1.406-1.406zM17.808 9.59l1.696-2.943c.094-.163.039-.37-.124-.464-.163-.094-.37-.038-.463.124l-1.717 2.977-1.695-2.977c-.093-.163-.301-.217-.463-.124-.163.094-.218.301-.124.464l1.696 2.943-1.691 2.943c-.093.163-.039.37.124.463.163.094.37.039.463-.124l1.717-2.977 1.717 2.977c.093.163.301.217.463.124.163-.094.218-.301.124-.464l-1.696-2.943zM23 12.22c0-.814-.394-1.532-1.03-2.04l-1.806-3.133c-.33-.572-.97-.943-1.664-.943h-2.72c-.694 0-1.334.37-1.664.943L7.97 10.18c-.636.508-1.03 1.226-1.03 2.04 0 .814.394 1.532 1.03 2.04l1.806 3.133c.33.572.97.943 1.664.943h2.72c.694 0 1.334-.37 1.664-.943l1.806-3.133c.636-.508 1.03-1.226 1.03-2.04z"/>
    </svg>
  ),
  Linux: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 2.668-.64.609-1.326.932-2.116.932-.155 0-.315-.008-.48-.021 4.226-.333 3.105-4.807 3.17-6.298.076-1.092.3-1.953 1.05-2.668.64-.609 1.326-.932 2.116-.932.155 0 .315.008.48.021zm-.538 2.099c-.105.026-1.3.302-2.964.302-1.476 0-2.56-.198-3.107-.302.085-1.914.713-3.454 2.836-3.454 1.039 0 1.819.571 2.807 1.198.946.601 2.05 1.313 3.347 1.98.155.088.344.143.544.156l-2.463.22zm1.996 2.131c-.39-.168-1.86-.378-3.322-.378-1.912 0-3.107.378-3.107.378l2.236 1.641 2.03-1.558c.199.17.564.354 1.163.354 1.061 0 1.275-.641 1.275-1.007 0-.13-.06-.337-.275-.43zm-6.403 3.064c.238.371 1.487 1.01 3.075 1.01 1.588 0 2.837-.639 3.075-1.01-.027-.06-.188-.449-.632-1.066-.568-.79-1.26-1.502-2.443-2.011-1.183-.508-1.906-.703-2.443-.703-.537 0-1.26.195-2.443.703-1.183.509-1.875 1.221-2.443 2.011-.444.617-.605 1.006-.632 1.066zm.856-1.339c.52 0 .833-.188 1.133-.396.297-.229.654-.52 1.324-.52.199 0 .984.093 1.429.093.447 0 1.228-.093 1.429-.093.67 0 1.027.291 1.324.52.3.208.614.396 1.134.396.199 0 .746-.093 1.306-.303.56-.21.854-.455.854-.832 0-.377-.294-.622-.854-.832-.56-.21-1.107-.303-1.306-.303-.199 0-.746.093-1.306.303-.56.21-.854.455-.854.832 0 .377.294.622.854.832.56.21 1.107.303 1.306.303.52 0 .833-.188 1.133-.396.297-.229.654-.52 1.324-.52.199 0 .984.093 1.429.093.447 0 1.228-.093 1.429-.093.67 0 1.027.291 1.324.52.3.208.614.396 1.134.396.199 0 .746-.093 1.306-.303.56-.21.854-.455.854-.832 0-.377-.294-.622-.854-.832-.56-.21-1.107-.303-1.306-.303-.199 0-.746.093-1.306.303l-1.429-.093c-.446 0-1.23.093-1.43.093-.67 0-1.026-.291-1.324-.52-.3-.208-.613-.396-1.133-.396-.199 0-.746.093-1.306.303-.56.21-.854.455-.854.832 0 .377.294.622.854.832.56.21 1.107.303 1.306.303.199 0 .746-.093 1.306-.303.56-.21.854-.455.854-.832 0-.377-.294-.622-.854-.832-.56-.21-1.107-.303-1.306-.303-.199 0-.746.093-1.306.303l-1.429-.093c-.446 0-1.23.093-1.43.093-.67 0-1.026-.291-1.324-.52-.3-.208-.613-.396-1.133-.396-.199 0-.746.093-1.306.303-.56.21-.854.455-.854.832 0 .377.294.622.854.832zm12.692.526c-.413 0-1.196.182-1.899.182-.703 0-1.486-.182-1.899-.182-.296 0-.538.092-.725.276-.169.17-.267.383-.294.638l-.006.092c.03.602.038 1.74.038 2.198 0 .423-.062.767-.187 1.032-.124.265-.304.485-.54.659-.236.175-.533.303-.889.384-.356.082-.765.123-1.227.123-.295 0-.62-.023-.974-.068a4.17 4.17 0 01-.987-.252 2.92 2.92 0 01-.763-.39c-.222-.165-.378-.327-.468-.486-.09-.159-.135-.34-.135-.543 0-.206.082-.383.245-.53.164-.147.454-.312.87-.495.416-.183.955-.396 1.616-.638.66-.242 1.405-.511 2.233-.806.828-.296 1.735-.611 2.718-.947.983-.336 2.007-.715 3.073-1.138 1.066-.423 2.107-.911 3.123-1.464-1.082-1.04-2.107-1.811-3.075-2.313-.968-.502-2.012-.753-3.133-.753zm-3.343 3.8l-.052.003c-.235.012-.543.102-.924.271-.38.169-.73.409-1.048.72-.318.311-.56.706-.725 1.186-.165.48-.248 1.042-.248 1.686 0 .783.154 1.396.462 1.839.308.443.77.664 1.385.664.308 0 .62-.074.935-.222.315-.148.608-.36.878-.636.27-.276.494-.616.672-1.021.178-.405.292-.86.342-1.366l.003-.088.037-1.766c.003-.206-.015-.37-.052-.492z"/>
    </svg>
  )
}

const osLabels: Record<string, string> = {
  Windows: 'Windows',
  macOS: 'macOS',
  iOS: 'iOS',
  Android: 'Android',
  Linux: 'Linux'
}

function OsDistributionWidget({ data, loading }: OsDistributionWidgetProps) {
  if (loading) {
    return (
      <div className="card p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Répartition OS</span>
        </div>
        <div className="flex items-center justify-center h-20">
          <div className="animate-pulse bg-surface-alt rounded-full h-14 w-14"></div>
        </div>
      </div>
    )
  }

  const osList = data?.osVersions || []
  const total = data?.total_devices || 0

  if (total === 0 || osList.length === 0) {
    return (
      <div className="card p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Répartition OS</span>
        </div>
        <div className="flex items-center justify-center h-20 text-sm text-text-muted">
          Aucune donnée
        </div>
      </div>
    )
  }

  const chartData = {
    labels: osList.map(os => os.os),
    datasets: [{
      data: osList.map(os => os.total),
      backgroundColor: osList.map(os => osColors[os.os] || '#e2e8f0'),
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  const options = {
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            const percentage = ((value / total) * 100).toFixed(1)
            return `${value} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Répartition OS</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-brand">{total}</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          {osList.map((os) => {
            const percentage = ((os.total / total) * 100).toFixed(1)
            const color = osColors[os.os] || '#e2e8f0'
            const IconComponent = osIcons[os.os]
            
            return (
              <div key={os.os} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ color }}>
                  {IconComponent || <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />}
                </div>
                <span className="text-sm text-brand flex-1">{osLabels[os.os] || os.os}</span>
                <span className="text-sm font-semibold text-brand">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OsDistributionWidget
