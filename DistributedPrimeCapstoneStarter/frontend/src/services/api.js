// ============================================================
// API SERVICE MODULE
// Centralized HTTP client for the Java Spring Boot REST API.
// All backend requests go through this module.
//
// The backend performs real distributed computation via Java RMI.
// The frontend never simulates prime computation, CPU usage,
// elections, or fault tolerance.
//
// During UI development, demo data is returned when no backend
// is configured. Every demo response is tagged with isDemo: true.
// ============================================================

import * as demo from './demoData.js'

// --- Configuration -------------------------------------------------------

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const STORAGE_KEY = 'cluster_monitor_api_base_url'
const ACTIVE_JOB_KEY = 'cluster_monitor_active_job_id'

export function getBaseUrl() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL
}

export function setBaseUrl(url) {
  localStorage.setItem(STORAGE_KEY, url)
}

export function isDemoMode() {
  const explicitlyConfigured = localStorage.getItem(STORAGE_KEY) !== null
  const environmentConfigured = Boolean(import.meta.env.VITE_API_BASE_URL)
  return !explicitlyConfigured && !environmentConfigured
}

// --- HTTP helper ---------------------------------------------------------

async function request(path, options = {}) {
  const base = getBaseUrl()
  const url = `${base}${path}`

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`API ${res.status}: ${body || res.statusText}`)
    }

    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return { data: await res.json(), isDemo: false, error: null }
    }
    return { data: await res.text(), isDemo: false, error: null }
  } catch (err) {
    return { data: null, isDemo: false, error: err.message }
  }
}

// --- API methods ---------------------------------------------------------

export const api = {
  // Cluster overview
  getClusterStatus: () => request('/cluster/status'),
  getCpuHistory: () => request('/cluster/cpu-history'),
  getTaskDistribution: () => request('/cluster/task-distribution'),
  getRecentEvents: () => request('/cluster/events'),

  // Nodes
  getNodes: () => request('/nodes'),
  getNode: (id) => request(`/nodes/${id}`),

  // Job execution
  startJob: async (config) => {
    const result = await request('/jobs/start', { method: 'POST', body: JSON.stringify(config) })
    if (!result.error && result.data?.jobId) localStorage.setItem(ACTIVE_JOB_KEY, result.data.jobId)
    return result
  },
  pauseJob: (jobId) => request(`/jobs/${jobId}/pause`, { method: 'POST' }),
  cancelJob: (jobId) => request(`/jobs/${jobId}/cancel`, { method: 'POST' }),
  getJobStatus: (jobId) => request(`/jobs/${jobId}`),
  getTasks: (jobId) => request(`/jobs/${jobId}/tasks`),

  // Load balancing
  getLoadBalancing: () => request('/load-balancing/status'),
  getAssignmentDecisions: () => request('/load-balancing/decisions'),

  // Fault tolerance
  getFaultTolerance: () => request('/fault-tolerance/status'),
  simulateNodeFailure: (nodeId) => request('/fault-tolerance/simulate-failure', {
    method: 'POST',
    body: JSON.stringify({ nodeId }),
  }),

  // Election
  getElectionEvents: () => request('/election/events'),
  getElectionLog: () => request('/election/log'),

  // Experiment results
  getExperimentResults: () => request('/experiments/results'),
}

// --- Demo fallback wrappers ----------------------------------------------

export function getClusterStatusWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_CLUSTER_STATUS, isDemo: true, error: null }
  return api.getClusterStatus()
}

export function getCpuHistoryWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_CPU_HISTORY, isDemo: true, error: null }
  return api.getCpuHistory()
}

export function getTaskDistributionWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_TASK_DISTRIBUTION, isDemo: true, error: null }
  return api.getTaskDistribution()
}

export function getRecentEventsWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_RECENT_EVENTS, isDemo: true, error: null }
  return api.getRecentEvents()
}

export function getNodesWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_NODES, isDemo: true, error: null }
  return api.getNodes()
}

export function getTasksWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_TASKS, isDemo: true, error: null }
  const jobId = localStorage.getItem(ACTIVE_JOB_KEY)
  if (!jobId) return { data: [], isDemo: false, error: null }
  return api.getTasks(jobId)
}

export function getLoadBalancingWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_LOAD_BALANCING, isDemo: true, error: null }
  return api.getLoadBalancing()
}

export function getAssignmentDecisionsWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_ASSIGNMENT_DECISIONS, isDemo: true, error: null }
  return api.getAssignmentDecisions()
}

export function getFaultToleranceWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_FAULT_TOLERANCE, isDemo: true, error: null }
  return api.getFaultTolerance()
}

export function getElectionEventsWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_ELECTION_EVENTS, isDemo: true, error: null }
  return api.getElectionEvents()
}

export function getElectionLogWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_ELECTION_LOG, isDemo: true, error: null }
  return api.getElectionLog()
}

export function getExperimentResultsWithFallback() {
  if (isDemoMode()) return { data: demo.DEMO_EXPERIMENT_STRUCTURE, isDemo: true, error: null }
  return api.getExperimentResults()
}
