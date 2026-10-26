import { useState } from 'react'
import { Settings, Save, Wifi, Server, Database } from 'lucide-react'
import { getBaseUrl, setBaseUrl, isDemoMode } from '../services/api.js'
import { useLocalStorage } from '../hooks/usePolling.js'
import { Card, CardHeader, CardBody, Badge, PageHeader } from '../components/ui.jsx'

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(getBaseUrl())
  const [pollInterval, setPollInterval] = useLocalStorage('cluster_monitor_poll_interval', '5000')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setBaseUrl(apiUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleReset() {
    const defaultUrl = 'http://localhost:8080/api'
    setApiUrl(defaultUrl)
    setBaseUrl(defaultUrl)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure backend connection and monitoring preferences" />

      {/* API Connection */}
      <Card>
        <CardHeader title="Backend API Connection" subtitle="Java Spring Boot REST API endpoint" icon={Server} />
        <CardBody className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8080/api"
              className="w-full rounded-md border border-navy-600 bg-navy-800 px-3 py-2 font-mono text-sm text-slate-200 outline-none transition focus:border-accent-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Save this URL to activate live API mode. Until you save a URL, the dashboard uses clearly labeled demo data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md border border-accent-500/30 bg-accent-500/10 px-4 py-2 text-sm font-medium text-accent-300 transition hover:bg-accent-500/20"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleReset}
              className="rounded-md border border-navy-600 bg-navy-800 px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-200"
            >
              Reset to Default
            </button>
            {saved && (
              <span className="text-xs text-success-400">Settings saved. Reload to apply.</span>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-md border border-navy-700 bg-navy-800/50 px-3 py-2 text-xs">
            <Wifi className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">
              Current mode: {isDemoMode() ? (
                <Badge variant="warning">Demo Mode (no backend)</Badge>
              ) : (
                <Badge variant="success">Live Backend</Badge>
              )}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Polling */}
      <Card>
        <CardHeader title="Data Refresh" subtitle="Polling interval for live updates" icon={Database} />
        <CardBody className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Poll Interval (ms)</label>
            <select
              value={pollInterval}
              onChange={(e) => setPollInterval(e.target.value)}
              className="rounded-md border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent-500"
            >
              <option value="2000">2 seconds</option>
              <option value="5000">5 seconds (default)</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Controls how frequently the dashboard polls the backend for updates. Shorter intervals provide more real-time data but increase network load.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* About */}
      <Card>
        <CardHeader title="About" icon={Settings} />
        <CardBody>
          <div className="space-y-2 text-sm text-slate-400">
            <p>
              <span className="font-medium text-slate-300">Cluster Monitor</span> — Frontend dashboard for the engineering capstone project
              "Adaptive Load Balancing in a Distributed Computing Cluster Using Real-Time Node Monitoring."
            </p>
            <p className="text-xs text-slate-500">
              The backend performs distributed prime counting via Java RMI across physical computers. This frontend
              visualizes cluster state, job execution, load balancing decisions, fault tolerance, and ring election events.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
