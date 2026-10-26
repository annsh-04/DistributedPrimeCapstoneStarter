import { useState } from 'react'
import { Menu, Wifi, WifiOff } from 'lucide-react'
import { Sidebar } from './Sidebar.jsx'
import { isDemoMode } from '../services/api.js'

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const demo = isDemoMode()

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy-700 bg-navy-900/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-navy-800 hover:text-slate-200 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <span className="font-mono">Cluster Monitor</span>
              <span className="text-navy-600">/</span>
              <span className="text-slate-400">Real-Time Node Monitoring</span>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            {demo ? (
              <div className="flex items-center gap-1.5 rounded-md border border-warning-500/30 bg-warning-500/10 px-2.5 py-1 text-xs text-warning-400">
                <WifiOff className="h-3.5 w-3.5" />
                <span>Demo Mode</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-md border border-success-500/30 bg-success-500/10 px-2.5 py-1 text-xs text-success-400">
                <Wifi className="h-3.5 w-3.5" />
                <span>Connected</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="fade-in p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
