import {
  Server, Cpu, MemoryStick, Clock, Hash, Wifi, WifiOff, Crown, Shield, Wrench,
} from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import { getNodesWithFallback } from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, StatusDot, ProgressBar, PageHeader } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

const roleConfig = {
  MASTER: { variant: 'master', icon: Crown, label: 'MASTER' },
  BACKUP: { variant: 'backup', icon: Shield, label: 'BACKUP' },
  WORKER: { variant: 'worker', icon: Wrench, label: 'WORKER' },
}

export function ClusterNodesPage() {
  const { data: nodes, isDemo, error, loading } = usePolling(getNodesWithFallback, 5000)

  if (loading) return <LoadingState message="Loading cluster nodes…" />
  if (error && !isDemo) return <ErrorState error={error} />

  return (
    <div className="space-y-6">
      <PageHeader title="Cluster Nodes" subtitle="Detailed status of all nodes in the distributed cluster" />
      <DemoBanner isDemo={isDemo} />

      <div className="grid gap-4 md:grid-cols-2">
        {(nodes || []).map((node) => {
          const role = roleConfig[node.role] || roleConfig.WORKER
          const RoleIcon = role.icon
          const isOnline = node.status === 'ONLINE'

          return (
            <Card key={node.nodeId} className={isOnline ? '' : 'border-danger-500/30'}>
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-md border p-2 ${isOnline ? 'border-navy-600 bg-navy-800' : 'border-danger-500/30 bg-danger-500/5'}`}>
                    <Server className={`h-5 w-5 ${isOnline ? 'text-slate-300' : 'text-danger-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-sm font-semibold text-slate-200">{node.nodeId}</h3>
                      <Badge variant={role.variant} size="xs">
                        <RoleIcon className="h-3 w-3" />
                        {role.label}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-slate-500">{node.ipAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Badge variant="success">
                      <Wifi className="h-3 w-3" /> ONLINE
                    </Badge>
                  ) : (
                    <Badge variant="danger">
                      <WifiOff className="h-3 w-3" /> OFFLINE
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card body */}
              <CardBody className="space-y-3">
                {/* CPU */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Cpu className="h-3.5 w-3.5" /> CPU Usage
                    </span>
                    <span className="font-mono text-slate-300">{node.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar
                    value={node.cpuUsage}
                    colorClass={node.cpuUsage > 80 ? 'bg-danger-500' : node.cpuUsage > 60 ? 'bg-warning-500' : 'bg-accent-500'}
                  />
                </div>

                {/* Memory */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MemoryStick className="h-3.5 w-3.5" /> Memory
                    </span>
                    <span className="font-mono text-slate-300">{node.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar
                    value={node.memoryUsage}
                    colorClass={node.memoryUsage > 80 ? 'bg-danger-500' : node.memoryUsage > 60 ? 'bg-warning-500' : 'bg-blue-glow'}
                  />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-md border border-navy-700 bg-navy-800/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">Active Tasks</p>
                    <p className="mt-0.5 font-mono text-sm text-slate-200">{node.activeTasks}</p>
                  </div>
                  <div className="rounded-md border border-navy-700 bg-navy-800/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">Logical Clock</p>
                    <p className="mt-0.5 font-mono text-sm text-slate-200">{node.logicalClock.toLocaleString()}</p>
                  </div>
                  <div className="rounded-md border border-navy-700 bg-navy-800/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">Last Heartbeat</p>
                    <p className="mt-0.5 font-mono text-sm text-slate-200">{node.lastHeartbeat}</p>
                  </div>
                  <div className="rounded-md border border-navy-700 bg-navy-800/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">Status</p>
                    <div className="mt-0.5">
                      <StatusDot status={node.status.toLowerCase()} label={node.status} />
                    </div>
                  </div>
                </div>

                {/* Offline warning */}
                {!isOnline && (
                  <div className="flex items-center gap-2 rounded-md border border-danger-500/30 bg-danger-500/5 px-3 py-2 text-xs text-danger-400">
                    <WifiOff className="h-3.5 w-3.5" />
                    <span>Node disconnected — heartbeat timeout exceeded. Tasks reassigned to available nodes.</span>
                  </div>
                )}
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
