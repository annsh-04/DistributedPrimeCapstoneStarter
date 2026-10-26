import { Vote, Crown, ArrowRight, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react'
import { usePolling } from '../hooks/usePolling.js'
import { getElectionEventsWithFallback, getElectionLogWithFallback } from '../services/api.js'
import { Card, CardHeader, CardBody, Badge, PageHeader } from '../components/ui.jsx'
import { DemoBanner, ErrorState, LoadingState } from '../components/StateDisplays.jsx'

export function ElectionHistoryPage() {
  const { data: elections, isDemo, error, loading } = usePolling(getElectionEventsWithFallback, 5000)
  const { data: log } = usePolling(getElectionLogWithFallback, 5000)

  if (loading) return <LoadingState message="Loading election history…" />
  if (error && !isDemo) return <ErrorState error={error} />

  return (
    <div className="space-y-6">
      <PageHeader title="Election History" subtitle="Ring election protocol events and coordinator selection" />
      <DemoBanner isDemo={isDemo} />

      {/* Election events */}
      <div className="space-y-4">
        {(elections || []).map((elec) => (
          <Card key={elec.eventId}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
              <div className="flex items-center gap-3">
                <Vote className="h-4 w-4 text-accent-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-200">{elec.eventId}</span>
                    <Badge variant="info" size="xs">{elec.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {elec.timestamp} · Initiated by <span className="font-mono text-slate-400">{elec.initiator}</span> · {elec.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-blue-300" />
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">Elected Coordinator</p>
                  <p className="font-mono text-sm font-semibold text-blue-300">{elec.electedCoordinator}</p>
                </div>
              </div>
            </div>

            <CardBody className="space-y-3">
              <p className="text-xs text-slate-500">{elec.reason}</p>

              {/* Message flow */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" /> Election Message Flow
                </p>
                <div className="space-y-1.5">
                  {elec.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded border px-3 py-1.5 text-xs ${
                        msg.status === 'DELIVERED'
                          ? 'border-navy-700 bg-navy-800/50'
                          : 'border-danger-500/30 bg-danger-500/5'
                      }`}
                    >
                      <span className="font-mono text-slate-400">{msg.from}</span>
                      <ArrowRight className={`h-3 w-3 ${msg.status === 'DELIVERED' ? 'text-slate-500' : 'text-danger-500'}`} />
                      <span className="font-mono text-slate-400">{msg.to}</span>
                      <span className="ml-auto font-mono text-accent-300">{msg.content}</span>
                      {msg.status === 'DELIVERED' ? (
                        <CheckCircle className="h-3.5 w-3.5 text-success-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-danger-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Chronological event log */}
      <Card>
        <CardHeader title="Election Event Log" subtitle="Chronological message-level log" icon={Clock} />
        <CardBody className="p-0">
          <div className="divide-y divide-navy-700/50 max-h-96 overflow-y-auto">
            {(log || []).map((entry, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-navy-800/30">
                <span className="mt-0.5 font-mono text-xs text-slate-600">{entry.timestamp}</span>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-medium ${
                      entry.level === 'success' ? 'text-success-400' :
                      entry.level === 'warning' ? 'text-warning-400' :
                      entry.level === 'error' ? 'text-danger-400' : 'text-slate-300'
                    }`}
                  >
                    {entry.event}
                  </span>
                  <p className="text-xs text-slate-500">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
