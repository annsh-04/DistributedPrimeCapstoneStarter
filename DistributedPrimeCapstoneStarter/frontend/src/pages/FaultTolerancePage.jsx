import {
  ShieldCheck, Crown, Shield, AlertTriangle, RefreshCw, Activity,
  ArrowRight, WifiOff, CheckCircle,
} from 'lucide-react'
import { useState } from 'react'
import { usePolling } from '../hooks/usePolling.js'
import { getFaultToleranceWithFallback, api, isDemoMode } from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, StatusDot, PageHeader } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

export function FaultTolerancePage() {
  const { data: ftData, isDemo, error, loading, refetch } = usePolling(getFaultToleranceWithFallback, 5000)
  const [simulateNodeId, setSimulateNodeId] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  async function handleSimulateFailure() {
    if (!simulateNodeId) return
    setSimulating(true)
    setSimResult(null)

    if (isDemoMode()) {
      setTimeout(() => {
        setSimulating(false)
        setSimResult({ success: true, message: `DEMO: Simulated failure of ${simulateNodeId}. In production, the backend will detect the failure, reassign tasks, and trigger election if needed.` })
      }, 800)
      return
    }

    const result = await api.simulateNodeFailure(simulateNodeId)
    setSimulating(false)
    if (result.error) {
      setSimResult({ success: false, message: result.error })
    } else {
      setSimResult({ success: true, message: `Failure simulated for ${simulateNodeId}. Backend is processing recovery.` })
      refetch()
    }
  }

  if (loading) return <LoadingState message="Loading fault tolerance data…" />
  if (error && !isDemo) return <ErrorState error={error} />

  const onlineNodes = (ftData?.failedNodes || [])
  // For the dropdown, use the nodes from demo data or status
  const candidateNodes = ['NODE-01', 'NODE-02', 'NODE-03', 'NODE-04']

  return (
    <div className="space-y-6">
      <PageHeader title="Fault Tolerance" subtitle="Primary-backup replication, failure detection, and task recovery" />
      <DemoBanner isDemo={isDemo} />

      {/* Primary-Backup status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={ftData?.primaryStatus === 'ACTIVE' ? 'border-success-500/20' : ''}>
          <CardHeader title="Primary Node" subtitle="Current master" icon={Crown} />
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-lg font-semibold text-blue-300">{ftData?.primaryNode}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusDot status={ftData?.primaryStatus?.toLowerCase()} />
                  <span className="text-xs text-slate-400">{ftData?.primaryStatus}</span>
                </div>
              </div>
              <Badge variant="master">
                <Crown className="h-3 w-3" /> MASTER
              </Badge>
            </div>
          </CardBody>
        </Card>

        <Card className={ftData?.backupStatus === 'STANDBY' ? 'border-warning-500/20' : ''}>
          <CardHeader title="Backup Node" subtitle="Ready to assume master role" icon={Shield} />
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-lg font-semibold text-accent-300">{ftData?.backupNode}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusDot status={ftData?.backupStatus?.toLowerCase()} />
                  <span className="text-xs text-slate-400">{ftData?.backupStatus}</span>
                </div>
              </div>
              <Badge variant="backup">
                <Shield className="h-3 w-3" /> BACKUP
              </Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sync info */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-success-400" />
            <span className="text-slate-300">
              Last primary-backup synchronization: <span className="font-mono text-accent-300">{ftData?.lastSync}</span>
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Simulate Node Failure */}
      <Card className="border-warning-500/30">
        <CardHeader
          title="Simulate Node Failure"
          subtitle="For backend integration testing — triggers failure detection, task reassignment, and election"
          icon={AlertTriangle}
        />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Select Node to Fail</label>
              <select
                value={simulateNodeId}
                onChange={(e) => setSimulateNodeId(e.target.value)}
                className="rounded-md border border-navy-600 bg-navy-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent-500"
              >
                <option value="">— Select a node —</option>
                {candidateNodes.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSimulateFailure}
              disabled={!simulateNodeId || simulating}
              className="flex items-center gap-1.5 rounded-md border border-warning-500/40 bg-warning-500/10 px-4 py-2 text-sm font-medium text-warning-400 transition hover:bg-warning-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {simulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              Simulate Failure
            </button>
          </div>
          {simResult && (
            <div
              className={`rounded-md border px-3 py-2 text-xs ${
                simResult.success
                  ? 'border-success-500/30 bg-success-500/5 text-success-400'
                  : 'border-danger-500/30 bg-danger-500/5 text-danger-400'
              }`}
            >
              {simResult.message}
            </div>
          )}
          <div className="rounded-md border border-navy-700 bg-navy-800/50 px-3 py-2 text-xs text-slate-500">
            <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
            When a node fails, the system will: (1) detect the heartbeat timeout, (2) reassign in-progress tasks to available nodes,
            (3) trigger a ring election if the master fails, and (4) update the backup assignment.
          </div>
        </CardBody>
      </Card>

      {/* Recovery events */}
      <Card>
        <CardHeader title="Task Recovery & Reassignment Events" subtitle="Automatic recovery actions" icon={Activity} />
        <CardBody className="p-0">
          <div className="divide-y divide-navy-700">
            {(ftData?.recoveryEvents || []).map((evt, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-navy-800/30">
                <div className="mt-0.5">
                  {evt.type === 'NODE_FAILURE' && <WifiOff className="h-4 w-4 text-danger-400" />}
                  {evt.type === 'TASK_REASSIGNMENT' && <RefreshCw className="h-4 w-4 text-warning-400" />}
                  {evt.type === 'MASTER_FAILOVER' && <Crown className="h-4 w-4 text-blue-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={evt.type === 'NODE_FAILURE' ? 'danger' : evt.type === 'MASTER_FAILOVER' ? 'master' : 'warning'} size="xs">
                      {evt.type}
                    </Badge>
                    <span className="font-mono text-xs text-slate-500">{evt.timestamp}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{evt.description}</p>
                  {evt.fromNode && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <span className="font-mono">{evt.fromNode}</span>
                      {evt.toNode ? (
                        <>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-mono">{evt.toNode}</span>
                          <span>· {evt.recoveredTasks} tasks recovered</span>
                        </>
                      ) : (
                        <span>· {evt.recoveredTasks} tasks pending reassignment</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
