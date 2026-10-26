// Reusable card components for the dashboard

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-navy-700 bg-navy-850 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

// Stat card — compact metric display
export function StatCard({ label, value, unit, icon: Icon, accentColor, sublabel }) {
  const colorClass = accentColor || 'text-accent-300'
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`mt-1.5 font-mono text-2xl font-semibold ${colorClass}`}>
            {value}
            {unit && <span className="ml-1 text-sm text-slate-500">{unit}</span>}
          </p>
          {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
        </div>
        {Icon && (
          <div className="rounded-md border border-navy-700 bg-navy-800 p-2">
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
        )}
      </div>
    </Card>
  )
}

// Badge — status indicators
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'border-navy-600 bg-navy-800 text-slate-300',
    success: 'border-success-500/30 bg-success-500/10 text-success-400',
    warning: 'border-warning-500/30 bg-warning-500/10 text-warning-400',
    danger: 'border-danger-500/30 bg-danger-500/10 text-danger-400',
    info: 'border-accent-500/30 bg-accent-500/10 text-accent-300',
    master: 'border-blue-glow/40 bg-blue-glow/10 text-blue-300',
    backup: 'border-accent-500/40 bg-accent-500/10 text-accent-300',
    worker: 'border-navy-500 bg-navy-700/50 text-slate-400',
  }
  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded border font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

// Status dot — pulsing indicator
export function StatusDot({ status, label }) {
  const colors = {
    online: 'bg-success-500',
    offline: 'bg-danger-500',
    active: 'bg-success-500',
    standby: 'bg-warning-500',
    operational: 'bg-success-500',
    degraded: 'bg-warning-500',
    critical: 'bg-danger-500',
  }
  const colorClass = colors[status?.toLowerCase()] || 'bg-slate-500'
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${colorClass} ${status === 'online' || status === 'active' || status === 'operational' ? 'pulse-dot' : ''}`} />
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </span>
  )
}

// Progress bar
export function ProgressBar({ value, max = 100, colorClass = 'bg-accent-500', height = 'h-2' }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className={`w-full overflow-hidden rounded-full bg-navy-700 ${height}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// Page header
export function PageHeader({ title, subtitle, actions, isDemo }) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
