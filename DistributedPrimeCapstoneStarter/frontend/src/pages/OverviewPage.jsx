import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts'
import {
  Cpu, MemoryStick, Server, CheckCircle2, XCircle, Clock,
  Hash, Timer, Activity, ServerCog, AlertCircle, Info, CheckCircle,
} from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import {
  getClusterStatusWithFallback,
  getCpuHistoryWithFallback,
  getTaskDistributionWithFallback,
  getRecentEventsWithFallback,
} from '../services/api.js'
import { Card, CardHeader, CardBody, StatCard, Badge, StatusDot, ProgressBar, PageHeader } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

const tooltipStyle = {
  backgroundColor: '#0f1420',
  border: '1px solid #2a3450',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#cbd5e1',
}

const eventIcon = {
  info: <Info className="h-3.5 w-3.5 text-accent-400" />,
  success: <CheckCircle className="h-3.5 w-3.5 text-success-400" />,
  warning: <AlertCircle className="h-3.5 w-3.5 text-warning-400" />,
  error: <XCircle className="h-3.5 w-3.5 text-danger-400" />,
}

export function OverviewPage() {
  const { data: status, isDemo, error, loading } = usePolling(getClusterStatusWithFallback, 5000)
  const { data: cpuHistory } = usePolling(getCpuHistoryWithFallback, 5000)
  const { data: taskDist } = usePolling(getTaskDistributionWithFallback, 5000)
  const { data: events } = usePolling(getRecentEventsWithFallback, 5000)

  if (loading) return <LoadingState message="Loading cluster status…" />
  if (error && !isDemo) return <ErrorState error={error} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cluster Overview"
        subtitle="Real-time monitoring of distributed computing cluster"
        isDemo={isDemo}
      />
      <DemoBanner isDemo={isDemo} />

      {/* Top status bar */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <StatusDot status={status?.status?.toLowerCase()} />
            <div>
              <p className="text-sm font-semibold text-slate-200">Cluster Status: {status?.status}</p>
              <p className="text-xs text-slate-500">Current Master: <span className="font-mono text-accent-300">{status?.masterNode}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success-500 pulse-dot" />
              <span className="text-slate-400">{status?.onlineNodes} Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger-500" />
              <span className="text-slate-400">{status?.offlineNodes} Offline</span>
            </div>
            <Badge variant="info">{status?.totalNodes} Total Nodes</Badge>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Avg CPU Usage" value={status?.avgCpuUsage?.toFixed(1)} unit="%" icon={Cpu} accentColor="text-accent-300" />
        <StatCard label="Avg Memory" value={status?.avgMemoryUsage?.toFixed(1)} unit="%" icon={MemoryStick} accentColor="text-blue-300" />
        <StatCard label="Active Tasks" value={status?.activeTasks} icon={Activity} accentColor="text-success-400" sublabel={`${status?.waitingTasks} waiting`} />
        <StatCard label="Completed" value={status?.completedTasks} icon={CheckCircle2} accentColor="text-success-400" sublabel={`${status?.failedTasks} failed`} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Failed Tasks" value={status?.failedTasks} icon={XCircle} accentColor="text-danger-400" />
        <StatCard label="Primes Found" value={status?.totalPrimesFound?.toLocaleString()} icon={Hash} accentColor="text-accent-300" />
        <StatCard label="Execution Time" value={status?.jobExecutionTime} icon={Timer} accentColor="text-blue-300" />
        <StatCard label="Job Progress" value={status?.jobProgress?.toFixed(1)} unit="%" icon={Clock} accentColor="text-success-400" />
      </div>

      {/* Job progress bar */}
      <Card>
        <CardHeader title="Current Job Progress" icon={ServerCog} />
        <CardBody>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Prime counting: 1 – 10,000,000</span>
            <span className="font-mono text-accent-300">{status?.jobProgress?.toFixed(1)}%</span>
          </div>
          <ProgressBar value={status?.jobProgress || 0} colorClass="bg-gradient-to-r from-accent-500 to-blue-glow" height="h-3" />
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* CPU utilization chart */}
        <Card>
          <CardHeader title="CPU Utilization" subtitle="Live per-node CPU usage (%)" icon={Cpu} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cpuHistory || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuN01" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cpuN02" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cpuN03" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="NODE01" stroke="#22d3ee" strokeWidth={1.5} fill="url(#cpuN01)" />
                <Area type="monotone" dataKey="NODE02" stroke="#3b82f6" strokeWidth={1.5} fill="url(#cpuN02)" />
                <Area type="monotone" dataKey="NODE03" stroke="#34d399" strokeWidth={1.5} fill="url(#cpuN03)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Task distribution chart */}
        <Card>
          <CardHeader title="Task Distribution" subtitle="Active tasks and CPU by node" icon={Server} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={taskDist || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
                <XAxis dataKey="node" tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#141a28' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                <Bar dataKey="tasks" name="Active Tasks" fill="#22d3ee" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cpu" name="CPU %" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent events */}
      <Card>
        <CardHeader title="Recent Cluster Events" subtitle="Latest system activity" icon={Activity} />
        <CardBody className="p-0">
          <div className="divide-y divide-navy-700">
            {(events || []).slice(0, 7).map((evt, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-navy-800/50">
                <span className="mt-0.5">{eventIcon[evt.severity]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">{evt.message}</p>
                  <p className="text-xs text-slate-600">
                    <span className="font-mono">{evt.timestamp}</span> · {evt.type} · {evt.node}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
