import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  PlayCircle,
  CalendarClock,
  Scale,
  ShieldCheck,
  Vote,
  FlaskConical,
  Settings,
  Activity,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/nodes', label: 'Cluster Nodes', icon: Server },
  { to: '/jobs', label: 'Job Execution', icon: PlayCircle },
  { to: '/scheduler', label: 'Task Scheduler', icon: CalendarClock },
  { to: '/load-balancing', label: 'Load Balancing', icon: Scale },
  { to: '/fault-tolerance', label: 'Fault Tolerance', icon: ShieldCheck },
  { to: '/election', label: 'Election History', icon: Vote },
  { to: '/experiments', label: 'Experiment Results', icon: FlaskConical },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-navy-700 bg-navy-900 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Title */}
        <div className="flex h-16 items-center gap-2.5 border-b border-navy-700 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-accent-500/40 bg-accent-500/10">
            <Activity className="h-4.5 w-4.5 text-accent-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Cluster Monitor</h1>
            <p className="text-[10px] text-slate-500">Adaptive Load Balancing</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Monitoring
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent-500/10 text-accent-300'
                          : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-navy-700 px-5 py-3">
          <p className="text-[10px] text-slate-600">Engineering Capstone Project</p>
          <p className="text-[10px] text-slate-600">Distributed Computing Cluster</p>
        </div>
      </aside>
    </>
  )
}
