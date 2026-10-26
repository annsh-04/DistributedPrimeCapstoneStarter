import { useState } from 'react'
import {
  Play, Pause, Square, Clock, Hash, TrendingUp, CheckCircle2, XCircle,
  RefreshCw, Activity, Timer,
} from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import { getTasksWithFallback, api, isDemoMode } from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, ProgressBar, PageHeader, StatCard } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

const taskStatusBadge = {
  RUNNING: <Badge variant="info">RUNNING</Badge>,
  COMPLETED: <Badge variant="success">COMPLETED</Badge>,
  FAILED: <Badge variant="danger">FAILED</Badge>,
  WAITING: <Badge variant="warning">WAITING</Badge>,
  PAUSED: <Badge>PAUSED</Badge>,
}

function formatNumber(n) {
  return n?.toLocaleString() ?? '—'
}

export function JobExecutionPage() {
  const { data: tasks, isDemo, error, loading, refetch } = usePolling(getTasksWithFallback, 5000)

  const [rangeStart, setRangeStart] = useState(1)
  const [rangeEnd, setRangeEnd] = useState(10000000)
  const [numTasks, setNumTasks] = useState(24)
  const [jobStatus, setJobStatus] = useState('IDLE')
  const [jobId, setJobId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function handleStart() {
    setActionError(null)
    setActionLoading(true)
    const config = { rangeStart: Number(rangeStart), rangeEnd: Number(rangeEnd), numTasks: Number(numTasks) }

    if (isDemoMode()) {
      setJobStatus('RUNNING')
      setJobId('DEMO-JOB-001')
      setActionLoading(false)
      return
    }

    const result = await api.startJob(config)
    setActionLoading(false)
    if (result.error) {
      setActionError(result.error)
    } else {
      setJobStatus('RUNNING')
      setJobId(result.data?.jobId || 'JOB-001')
    }
  }

  async function handlePause() {
    if (isDemoMode()) { setJobStatus('PAUSED'); return }
    const result = await api.pauseJob(jobId)
    if (result.error) setActionError(result.error)
    else setJobStatus('PAUSED')
  }

  async function handleCancel() {
    if (isDemoMode()) { setJobStatus('CANCELLED'); return }
    const result = await api.cancelJob(jobId)
    if (result.error) setActionError(result.error)
    else setJobStatus('CANCELLED')
  }

  if (loading) return <LoadingState message="Loading job execution data…" />

  const completed = (tasks || []).filter((t) => t.status === 'COMPLETED').length
  const failed = (tasks || []).filter((t) => t.status === 'FAILED').length
  const running = (tasks || []).filter((t) => t.status === 'RUNNING').length
  const totalPrimes = (tasks || []).reduce((sum, t) => sum + (t.result || 0), 0)
  const progress = tasks?.length ? (completed / tasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Job Execution" subtitle="Configure and monitor distributed prime counting jobs" />
      <DemoBanner isDemo={isDemo} />

      {/* Job configuration */}
      <Card>
        <CardHeader title="Job Configuration" subtitle="Set parameters and control execution" icon={Activity} />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Range Start</label>
              <input
                type="number"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                disabled={jobStatus === 'RUNNING'}
                className="w-full rounded-md border border-navy-600 bg-navy-800 px-3 py-2 font-mono text-sm text-slate-200 outline-none transition focus:border-accent-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Range End</label>
              <input
                type="number"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                disabled={jobStatus === 'RUNNING'}
                className="w-full rounded-md border border-navy-600 bg-navy-800 px-3 py-2 font-mono text-sm text-slate-200 outline-none transition focus:border-accent-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Number of Tasks</label>
              <input
                type="number"
                value={numTasks}
                onChange={(e) => setNumTasks(e.target.value)}
                disabled={jobStatus === 'RUNNING'}
                className="w-full rounded-md border border-navy-600 bg-navy-800 px-3 py-2 font-mono text-sm text-slate-200 outline-none transition focus:border-accent-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStart}
              disabled={jobStatus === 'RUNNING' || actionLoading}
              className="flex items-center gap-1.5 rounded-md border border-success-500/30 bg-success-500/10 px-4 py-2 text-sm font-medium text-success-400 transition hover:bg-success-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Job
            </button>
            <button
              onClick={handlePause}
              disabled={jobStatus !== 'RUNNING'}
              className="flex items-center gap-1.5 rounded-md border border-warning-500/30 bg-warning-500/10 px-4 py-2 text-sm font-medium text-warning-400 transition hover:bg-warning-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
            <button
              onClick={handleCancel}
              disabled={jobStatus === 'IDLE' || jobStatus === 'CANCELLED'}
              className="flex items-center gap-1.5 rounded-md border border-danger-500/30 bg-danger-500/10 px-4 py-2 text-sm font-medium text-danger-400 transition hover:bg-danger-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Square className="h-4 w-4" />
              Cancel
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              {jobStatus === 'RUNNING' && <Badge variant="info">RUNNING</Badge>}
              {jobStatus === 'PAUSED' && <Badge variant="warning">PAUSED</Badge>}
              {jobStatus === 'IDLE' && <Badge>IDLE</Badge>}
              {jobStatus === 'CANCELLED' && <Badge variant="danger">CANCELLED</Badge>}
            </div>
          </div>

          {actionError && (
            <div className="rounded-md border border-danger-500/30 bg-danger-500/5 px-3 py-2 text-xs text-danger-400">
              {actionError}
            </div>
          )}

          {/* Progress bar */}
          {jobStatus !== 'IDLE' && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Job Progress</span>
                <span className="font-mono text-accent-300">{progress.toFixed(1)}%</span>
              </div>
              <ProgressBar value={progress} colorClass="bg-gradient-to-r from-accent-500 to-blue-glow" height="h-2.5" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Execution stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Running" value={running} icon={Activity} accentColor="text-accent-300" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} accentColor="text-success-400" />
        <StatCard label="Failed" value={failed} icon={XCircle} accentColor="text-danger-400" />
        <StatCard label="Primes Found" value={totalPrimes.toLocaleString()} icon={Hash} accentColor="text-accent-300" />
      </div>

      {/* Task table */}
      <Card>
        <CardHeader
          title="Task Execution Table"
          subtitle="Individual task assignments and results"
          icon={Timer}
          action={
            <button onClick={refetch} className="rounded-md p-1.5 text-slate-400 hover:bg-navy-800 hover:text-slate-200">
              <RefreshCw className="h-4 w-4" />
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-xs text-slate-500">
                <th className="px-4 py-2.5 text-left font-medium">Task ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Range</th>
                <th className="px-4 py-2.5 text-left font-medium">Assigned Node</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Result (primes)</th>
                <th className="px-4 py-2.5 text-right font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {(tasks || []).map((task) => (
                <tr key={task.taskId} className="hover:bg-navy-800/30">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-300">{task.taskId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                    [{formatNumber(task.rangeStart)} – {formatNumber(task.rangeEnd)}]
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-accent-300">{task.assignedNode}</td>
                  <td className="px-4 py-2.5">{taskStatusBadge[task.status] || <Badge>{task.status}</Badge>}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-300">
                    {task.result !== null ? task.result.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-400">{task.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
