import { HashRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { ClusterNodesPage } from './pages/ClusterNodesPage.jsx'
import { JobExecutionPage } from './pages/JobExecutionPage.jsx'
import { TaskSchedulerPage } from './pages/TaskSchedulerPage.jsx'
import { LoadBalancingPage } from './pages/LoadBalancingPage.jsx'
import { FaultTolerancePage } from './pages/FaultTolerancePage.jsx'
import { ElectionHistoryPage } from './pages/ElectionHistoryPage.jsx'
import { ExperimentResultsPage } from './pages/ExperimentResultsPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'

function App() {
  return (
    <HashRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/nodes" element={<ClusterNodesPage />} />
          <Route path="/jobs" element={<JobExecutionPage />} />
          <Route path="/scheduler" element={<TaskSchedulerPage />} />
          <Route path="/load-balancing" element={<LoadBalancingPage />} />
          <Route path="/fault-tolerance" element={<FaultTolerancePage />} />
          <Route path="/election" element={<ElectionHistoryPage />} />
          <Route path="/experiments" element={<ExperimentResultsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </DashboardLayout>
    </HashRouter>
  )
}

export default App
