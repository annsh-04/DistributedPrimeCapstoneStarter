# Cluster Monitor — Adaptive Load Balancing Dashboard

Frontend dashboard for the engineering capstone project:

> **Adaptive Load Balancing in a Distributed Computing Cluster Using Real-Time Node Monitoring**

This React application visualizes real-time cluster state, job execution, load balancing decisions, fault tolerance events, and ring election history for a distributed computing cluster that performs prime counting via Java RMI across physical computers.

## Technology Stack

- **React** with **Vite** (JavaScript)
- **Tailwind CSS** v4 for styling
- **Recharts** for data visualization
- **Lucide** icons
- **React Router** for navigation

## Pages

| Page | Description |
|------|-------------|
| Overview | Cluster status, CPU/memory utilization, task counts, live CPU chart, task distribution chart, recent events |
| Cluster Nodes | Per-node cards with role (Master/Backup/Worker), status, CPU, memory, active tasks, logical clock, heartbeat |
| Job Execution | Configurable prime counting range and task count, start/pause/cancel controls, progress bar, task table |
| Task Scheduler | Task queue, scheduling order, node assignments, completion history |
| Load Balancing | Per-node load scores (CPU + tasks × 10), assignment decisions with reasoning, worker distribution |
| Fault Tolerance | Primary-backup status, recovery events, simulated node failure control |
| Election History | Ring election events with message flow, elected coordinator, chronological event log |
| Experiment Results | Benchmark comparison across 1–4 computers (speedup and efficiency shown only when real data is available) |
| Settings | Backend API URL configuration, polling interval |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

The dashboard will be available at the URL shown in your terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Backend Integration

All HTTP requests are centralized in `src/services/api.js`. The frontend expects a Java Spring Boot REST API at a configurable base URL (default: `http://localhost:8080/api`).

### API Endpoints Expected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cluster/status` | Cluster overview metrics |
| GET | `/cluster/cpu-history` | Per-node CPU time series |
| GET | `/cluster/task-distribution` | Task counts per node |
| GET | `/cluster/events` | Recent cluster events |
| GET | `/nodes` | All node details |
| GET | `/nodes/:id` | Single node details |
| POST | `/jobs/start` | Start a new prime counting job |
| POST | `/jobs/:id/pause` | Pause a running job |
| POST | `/jobs/:id/cancel` | Cancel a running job |
| GET | `/jobs/:id` | Job status and progress |
| GET | `/jobs/:id/tasks` | Task list for a job |
| GET | `/load-balancing/status` | Load scores per node |
| GET | `/load-balancing/decisions` | Recent assignment decisions |
| GET | `/fault-tolerance/status` | Primary-backup and recovery status |
| POST | `/fault-tolerance/simulate-failure` | Simulate a node failure |
| GET | `/election/events` | Ring election events |
| GET | `/election/log` | Chronological election log |
| GET | `/experiments/results` | Benchmark results (1–4 computers) |

### Configuration

1. Open the **Settings** page in the dashboard.
2. Enter your Java Spring Boot API URL.
3. Click **Save** and reload the page.

When the API URL is set to the default `http://localhost:8080/api`, the dashboard runs in **Demo Mode** and displays clearly labeled placeholder data. Once a real backend URL is configured and reachable, the dashboard fetches live data automatically.

### Polling

The dashboard polls the backend at a configurable interval (default: 5 seconds). This can be changed in **Settings**. For real-time streaming, the API module can be extended to support Server-Sent Events (SSE) — see `src/services/api.js`.

## Project Structure

```
src/
├── components/
│   ├── DashboardLayout.jsx    # Sidebar + top bar layout wrapper
│   ├── Sidebar.jsx            # Navigation sidebar
│   ├── StateDisplays.jsx      # Demo banner, error, loading, disconnected states
│   └── ui.jsx                 # Card, Badge, StatCard, ProgressBar, etc.
├── hooks/
│   └── usePolling.js          # Polling hook + localStorage hook
├── pages/
│   ├── OverviewPage.jsx
│   ├── ClusterNodesPage.jsx
│   ├── JobExecutionPage.jsx
│   ├── TaskSchedulerPage.jsx
│   ├── LoadBalancingPage.jsx
│   ├── FaultTolerancePage.jsx
│   ├── ElectionHistoryPage.jsx
│   ├── ExperimentResultsPage.jsx
│   └── SettingsPage.jsx
├── services/
│   ├── api.js                 # Centralized HTTP client + demo fallbacks
│   └── demoData.js            # Placeholder data (clearly labeled as DEMO DATA)
├── App.jsx                    # Router and route definitions
└── main.jsx                   # Application entry point
```

## Important Notes

- The frontend **does not simulate** prime computation, node CPU usage, elections, or fault tolerance. All placeholder data is clearly labeled as **DEMO DATA**.
- Experiment Results page shows speedup and efficiency **only** when the backend provides real benchmark measurements. No benchmark numbers are invented.
- The "Simulate Node Failure" control on the Fault Tolerance page is designed for backend integration testing and sends a POST request to the API when a live backend is configured.
