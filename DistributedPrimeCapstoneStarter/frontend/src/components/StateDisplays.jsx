import { AlertTriangle, Database } from 'lucide-react'

// Demo banner shown on pages using placeholder data
export function DemoBanner({ isDemo }) {
  if (!isDemo) return null
  return (
    <div className="flex items-center gap-2 rounded-md border border-warning-500/30 bg-warning-500/10 px-3 py-1.5 text-xs text-warning-400">
      <Database className="h-3.5 w-3.5 shrink-0" />
      <span>DEMO DATA — Not connected to a live backend. Metrics shown are placeholder values for UI development.</span>
    </div>
  )
}

// Error state
export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-danger-500/30 bg-danger-500/5 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-danger-500" />
      <div>
        <p className="text-sm font-medium text-danger-400">Connection Error</p>
        <p className="mt-1 text-xs text-slate-400">{error || 'Unable to reach the cluster API.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-md border border-navy-600 bg-navy-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-accent-500 hover:text-accent-300"
        >
          Retry Connection
        </button>
      )}
    </div>
  )
}

// Disconnected state
export function DisconnectedState({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-danger-500/30 bg-danger-500/5 px-3 py-2 text-xs text-danger-400">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{message || 'Disconnected from cluster API.'}</span>
    </div>
  )
}

// Loading state
export function LoadingState({ message }) {
  return (
    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy-600 border-t-accent-500" />
      <span>{message || 'Loading…'}</span>
    </div>
  )
}
