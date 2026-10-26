import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Scale, Cpu, Activity, ArrowRight, TrendingUp } from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import {
  getLoadBalancingWithFallback,
  getAssignmentDecisionsWithFallback,
  getTaskDistributionWithFallback,
} from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, ProgressBar, PageHeader } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

const tooltipStyle = {
  backgroundColor: '#0f1420',
  border: '1px solid #2a3450',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#cbd5e1',
}

function loadScoreColor(score) {
  if (score === 0) return '#3a4670'
  if (score < 60) return '#34d399'
  if (score < 100) return '#22d3ee'
  if (score < 150) return '#fbbf24'
  return '#f87171'
}

export function LoadBalancingPage() {
  const { data: loadData, isDemo, error, loading } = usePolling(getLoadBalancingWithFallback, 5000)
  const { data: decisions } = usePolling(getAssignmentDecisionsWithFallback, 5000)
  const { data: workerDist } = usePolling(getTaskDistributionWithFallback, 5000)

  if (loading) return <LoadingState message="Loading load balancing data…" />
  if (error && !isDemo) return <ErrorState error={error} />

  const chartData = (loadData || []).map((n) => ({
    node: n.nodeId,
    loadScore: n.loadScore,
    cpu: n.cpuUsage,
    tasks: n.activeTasks,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Load Balancing" subtitle="Adaptive CPU-based load scoring and task assignment" />
      <DemoBanner isDemo={isDemo} />

      {/* Load score explanation */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-3 text-sm">
            <Scale className="h-5 w-5 text-accent-400" />
            <div>
              <p className="text-slate-300">
                <span className="font-semibold">Load Score</span> = CPU Usage + (Active Tasks × 10)
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                The scheduler assigns new tasks to the online node with the lowest load score. Weighted round-robin prevents starvation.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Per-node load table */}
      <Card>
        <CardHeader title="Node Load Metrics" subtitle="Current CPU, tasks, and computed load score per node" icon={Cpu} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-xs text-slate-500">
                <th className="px-4 py-2.5 text-left font-medium">Node</th>
                <th className="px-4 py-2.5 text-left font-medium">Role</th>
                <th className="px-4 py-2.5 text-right font-medium">CPU Usage</th>
                <th className="px-4 py-2.5 text-right font-medium">Active Tasks</th>
                <th className="px-4 py-2.5 text-right font-medium">Load Score</th>
                <th className="px-4 py-2.5 text-left font-medium">Score Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {(loadData || []).map((n) => (
                <tr key={n.nodeId} className="hover:bg-navy-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-200">{n.nodeId}</td>
                  <td className="px-4 py-3">
                    <Badge variant={n.role === 'MASTER' ? 'master' : n.role === 'BACKUP' ? 'backup' : 'worker'}>
                      {n.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{n.cpuUsage.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{n.activeTasks}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold" style={{ color: loadScoreColor(n.loadScore) }}>
                    {n.loadScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <ProgressBar
                        value={n.loadScore}
                        max={200}
                        colorClass=""
                        height="h-1.5"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Load score chart */}
      <Card>
        <CardHeader title="Load Score Distribution" subtitle="Visual comparison across all nodes" icon={TrendingUp} />
        <CardBody>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
              <XAxis dataKey="node" tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#141a28' }} />
              <Bar dataKey="loadScore" name="Load Score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={loadScoreColor(entry.loadScore)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Assignment decisions */}
      <Card>
        <CardHeader title="Task Assignment Decisions" subtitle="Recent scheduling decisions with reasoning" icon={Activity} />
        <CardBody className="space-y-4">
          {(decisions || []).map((dec, i) => (
            <div key={i} className="rounded-md border border-navy-700 bg-navy-800/50 p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">{dec.time}</span>
                  <Badge variant="info">{dec.taskId}</Badge>
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span className="font-mono text-accent-300">{dec.selectedNode}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-300">{dec.reason}</p>
              {/* Candidate scores */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {dec.candidates.map((c) => (
                  <div
                    key={c.node}
                    className={`rounded border px-2.5 py-1.5 ${
                      c.selected
                        ? 'border-accent-500/40 bg-accent-500/10'
                        : 'border-navy-700 bg-navy-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400">{c.node}</span>
                      {c.selected && <Badge variant="info" size="xs">SELECTED</Badge>}
                    </div>
                    <p className="mt-0.5 font-mono text-sm font-semibold" style={{ color: loadScoreColor(c.loadScore) }}>
                      {c.loadScore.toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Worker distribution */}
      <Card>
        <CardHeader title="Task Distribution Across Workers" subtitle="Total assigned, completed, and failed per worker" icon={Scale} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-xs text-slate-500">
                <th className="px-4 py-2.5 text-left font-medium">Worker Node</th>
                <th className="px-4 py-2.5 text-right font-medium">Currently Assigned</th>
                <th className="px-4 py-2.5 text-right font-medium">Completed</th>
                <th className="px-4 py-2.5 text-right font-medium">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {(workerDist || []).map((w) => (
                <tr key={w.node} className="hover:bg-navy-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-slate-200">{w.node}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-accent-300">{w.assigned}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-success-400">{w.completed}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-danger-400">{w.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
