import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { FlaskConical, Clock, TrendingUp, Zap, Info } from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import { getExperimentResultsWithFallback } from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, PageHeader } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

const tooltipStyle = {
  backgroundColor: '#0f1420',
  border: '1px solid #2a3450',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#cbd5e1',
}

export function ExperimentResultsPage() {
  const { data: experimentData, isDemo, error, loading } = usePolling(getExperimentResultsWithFallback, 10000)

  if (loading) return <LoadingState message="Loading experiment results…" />
  if (error && !isDemo) return <ErrorState error={error} />

  // Check if real benchmark data is available (has executionTime field)
  const hasRealData = (experimentData || []).some((e) => e.executionTime !== undefined && e.executionTime !== null)
  const baselineTime = hasRealData ? experimentData.find((e) => e.numComputers === 1)?.executionTime : null

  const chartData = hasRealData
    ? experimentData.map((e) => ({
        computers: `${e.numComputers} PC${e.numComputers > 1 ? 's' : ''}`,
        executionTime: e.executionTime,
        speedup: baselineTime ? (baselineTime / e.executionTime).toFixed(2) : null,
        efficiency: baselineTime ? ((baselineTime / e.executionTime) / e.numComputers * 100).toFixed(1) : null,
      }))
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experiment Results"
        subtitle="Benchmark comparison: 1 vs 2 vs 3 vs 4 computers"
      />
      <DemoBanner isDemo={isDemo} />

      {/* Info banner if no real data */}
      {!hasRealData && (
        <Card className="border-accent-500/20">
          <CardBody>
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Awaiting Benchmark Measurements</p>
                <p className="mt-1 text-xs text-slate-500">
                  No benchmark data has been received from the backend yet. The table below shows the experiment structure.
                  Speedup and efficiency will be displayed automatically once the Java backend reports real execution times
                  from distributed prime counting runs across 1, 2, 3, and 4 physical computers.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Experiment structure table */}
      <Card>
        <CardHeader
          title="Experiment Configuration"
          subtitle="Distributed benchmark runs across physical computers"
          icon={FlaskConical}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-xs text-slate-500">
                <th className="px-4 py-2.5 text-left font-medium"># Computers</th>
                <th className="px-4 py-2.5 text-left font-medium">Nodes</th>
                <th className="px-4 py-2.5 text-right font-medium">Execution Time</th>
                <th className="px-4 py-2.5 text-right font-medium">Speedup</th>
                <th className="px-4 py-2.5 text-right font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {(experimentData || []).map((exp) => {
                const speedup = hasRealData && baselineTime ? (baselineTime / exp.executionTime).toFixed(2) : null
                const efficiency = hasRealData && baselineTime ? ((baselineTime / exp.executionTime) / exp.numComputers * 100).toFixed(1) : null
                return (
                  <tr key={exp.numComputers} className="hover:bg-navy-800/30">
                    <td className="px-4 py-3">
                      <Badge variant="info">{exp.numComputers} computer{exp.numComputers > 1 ? 's' : ''}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {exp.nodes?.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {exp.executionTime !== undefined ? (
                        <span className="text-accent-300">{exp.executionTime.toFixed(2)}s</span>
                      ) : (
                        <span className="text-slate-600">— pending —</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {speedup ? (
                        <span className="text-success-400">{speedup}×</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {efficiency ? (
                        <span className="text-blue-300">{efficiency}%</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts only when real data is available */}
      {hasRealData && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Execution time chart */}
            <Card>
              <CardHeader title="Execution Time" subtitle="Lower is better" icon={Clock} />
              <CardBody>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
                    <XAxis dataKey="computers" tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" unit="s" />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#141a28' }} />
                    <Bar dataKey="executionTime" name="Execution Time (s)" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Speedup chart */}
            <Card>
              <CardHeader title="Speedup" subtitle="Relative to single-computer baseline" icon={TrendingUp} />
              <CardBody>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
                    <XAxis dataKey="computers" tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#141a28' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                    <Bar dataKey="speedup" name="Speedup (×)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Efficiency chart */}
          <Card>
            <CardHeader title="Parallel Efficiency" subtitle="Speedup / # computers × 100% — ideal is 100%" icon={Zap} />
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
                  <XAxis dataKey="computers" tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} stroke="#2a3450" unit="%" />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#141a28' }} />
                  <Bar dataKey="efficiency" name="Efficiency (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
