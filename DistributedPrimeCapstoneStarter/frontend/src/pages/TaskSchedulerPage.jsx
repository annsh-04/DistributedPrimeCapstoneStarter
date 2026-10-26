import {
  CalendarClock, Clock, ListOrdered, ArrowRight, Activity, Hash,
} from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import { getTasksWithFallback, getNodesWithFallback } from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, ProgressBar, PageHeader, StatCard } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

const taskStatusBadge = {
  RUNNING: <Badge variant="info">RUNNING</Badge>,
  COMPLETED: <Badge variant="success">COMPLETED</Badge>,
  FAILED: <Badge variant="danger">FAILED</Badge>,
  WAITING: <Badge variant="warning">QUEUED</Badge>,
}

export function TaskSchedulerPage() {
  const { data: tasks, isDemo, error, loading } = usePolling(getTasksWithFallback, 5000)
  const { data: nodes } = usePolling(getNodesWithFallback, 5000)

  if (loading) return <LoadingState message="Loading scheduler data…" />
  if (error && !isDemo) return <ErrorState error={error} />

  const queued = (tasks || []).filter((t) => t.status === 'WAITING' || t.status === 'RUNNING')
  const completed = (tasks || []).filter((t) => t.status === 'COMPLETED')
  const running = (tasks || []).filter((t) => t.status === 'RUNNING')

  // Build a simple queue view: running first, then queued
  const queue = [...running, ...(tasks || []).filter((t) => t.status === 'WAITING')]
  const history = completed.slice(0, 8)

  // Node capacity
  const nodeMap = {}
  ;(nodes || []).forEach((n) => {
    nodeMap[n.nodeId] = n
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Task Scheduler" subtitle="View task queue, scheduling order, and assignment history" />
      <DemoBanner isDemo={isDemo} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Running" value={running.length} icon={Activity} accentColor="text-accent-300" />
        <StatCard label="Queued" value={queued.length - running.length} icon={Clock} accentColor="text-warning-400" />
        <StatCard label="Completed" value={completed.length} icon={Hash} accentColor="text-success-400" />
        <StatCard label="Active Nodes" value={(nodes || []).filter((n) => n.status === 'ONLINE').length} icon={ListOrdered} accentColor="text-blue-300" />
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader title="Task Queue" subtitle="Current execution order and node assignments" icon={CalendarClock} />
        <CardBody className="p-0">
          <div className="divide-y divide-navy-700">
            {queue.map((task, i) => {
              const node = nodeMap[task.assignedNode]
              return (
                <div key={task.taskId} className="flex items-center gap-4 px-4 py-3 hover:bg-navy-800/30">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-navy-600 bg-navy-800 text-xs font-mono text-slate-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-300">{task.taskId}</span>
                      {taskStatusBadge[task.status] || <Badge>{task.status}</Badge>}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      Range [{task.rangeStart?.toLocaleString()} – {task.rangeEnd?.toLocaleString()}]
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="text-xs text-slate-500">→</span>
                    <span className="font-mono text-xs text-accent-300">{task.assignedNode}</span>
                  </div>
                  {node && (
                    <div className="hidden w-24 md:block">
                      <ProgressBar
                        value={node.cpuUsage}
                        colorClass={node.cpuUsage > 80 ? 'bg-danger-500' : 'bg-accent-500'}
                        height="h-1.5"
                      />
                      <p className="mt-0.5 text-right text-[10px] text-slate-600">{node.cpuUsage.toFixed(0)}% CPU</p>
                    </div>
                  )}
                </div>
              )
            })}
            {queue.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">No tasks currently scheduled.</div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Completion History */}
      <Card>
        <CardHeader title="Recent Completions" subtitle="Most recently finished tasks" icon={ArrowRight} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-xs text-slate-500">
                <th className="px-4 py-2.5 text-left font-medium">Task ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Range</th>
                <th className="px-4 py-2.5 text-left font-medium">Node</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Primes</th>
                <th className="px-4 py-2.5 text-right font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {history.map((task) => (
                <tr key={task.taskId} className="hover:bg-navy-800/30">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-300">{task.taskId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                    [{task.rangeStart?.toLocaleString()} – {task.rangeEnd?.toLocaleString()}]
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-accent-300">{task.assignedNode}</td>
                  <td className="px-4 py-2.5">{taskStatusBadge[task.status]}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-300">
                    {task.result?.toLocaleString() || '—'}
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
