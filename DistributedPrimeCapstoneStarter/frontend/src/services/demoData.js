// ============================================================
// DEMO DATA — Placeholder values for UI development only.
// The Java Spring Boot backend will provide real metrics via RMI.
// All demo data is clearly labeled and must NOT be presented as
// real cluster measurements.
// ============================================================

export const DEMO_NODES = [
  {
    nodeId: 'NODE-01',
    ipAddress: '192.168.1.101',
    role: 'MASTER',
    status: 'ONLINE',
    cpuUsage: 73.2,
    memoryUsage: 58.4,
    activeTasks: 6,
    logicalClock: 4827,
    lastHeartbeat: '2s ago',
    isBackup: false,
  },
  {
    nodeId: 'NODE-02',
    ipAddress: '192.168.1.102',
    role: 'BACKUP',
    status: 'ONLINE',
    cpuUsage: 41.8,
    memoryUsage: 37.1,
    activeTasks: 4,
    logicalClock: 4823,
    lastHeartbeat: '1s ago',
    isBackup: true,
  },
  {
    nodeId: 'NODE-03',
    ipAddress: '192.168.1.103',
    role: 'WORKER',
    status: 'ONLINE',
    cpuUsage: 88.5,
    memoryUsage: 71.2,
    activeTasks: 8,
    logicalClock: 4819,
    lastHeartbeat: '3s ago',
    isBackup: false,
  },
  {
    nodeId: 'NODE-04',
    ipAddress: '192.168.1.104',
    role: 'WORKER',
    status: 'OFFLINE',
    cpuUsage: 0,
    memoryUsage: 0,
    activeTasks: 0,
    logicalClock: 4801,
    lastHeartbeat: '47s ago',
    isBackup: false,
  },
]

export const DEMO_CLUSTER_STATUS = {
  status: 'OPERATIONAL',
  masterNode: 'NODE-01',
  backupNode: 'NODE-02',
  onlineNodes: 3,
  offlineNodes: 1,
  totalNodes: 4,
  avgCpuUsage: 67.7,
  avgMemoryUsage: 55.6,
  activeTasks: 18,
  waitingTasks: 6,
  completedTasks: 342,
  failedTasks: 2,
  totalPrimesFound: 664579,
  jobExecutionTime: '00:14:32',
  jobProgress: 62.5,
}

export const DEMO_CPU_HISTORY = [
  { time: '14:31', NODE01: 45, NODE02: 30, NODE03: 70, NODE04: 50 },
  { time: '14:32', NODE01: 52, NODE02: 35, NODE03: 75, NODE04: 55 },
  { time: '14:33', NODE01: 48, NODE02: 38, NODE03: 82, NODE04: 48 },
  { time: '14:34', NODE01: 61, NODE02: 33, NODE03: 79, NODE04: 42 },
  { time: '14:35', NODE01: 55, NODE02: 41, NODE03: 85, NODE04: 38 },
  { time: '14:36', NODE01: 67, NODE02: 44, NODE03: 88, NODE04: 0 },
  { time: '14:37', NODE01: 70, NODE02: 39, NODE03: 91, NODE04: 0 },
  { time: '14:38', NODE01: 73, NODE02: 41, NODE03: 88, NODE04: 0 },
  { time: '14:39', NODE01: 68, NODE02: 43, NODE03: 86, NODE04: 0 },
  { time: '14:40', NODE01: 73, NODE02: 42, NODE03: 89, NODE04: 0 },
]

export const DEMO_TASK_DISTRIBUTION = [
  { node: 'NODE-01', tasks: 6, cpu: 73 },
  { node: 'NODE-02', tasks: 4, cpu: 42 },
  { node: 'NODE-03', tasks: 8, cpu: 89 },
  { node: 'NODE-04', tasks: 0, cpu: 0 },
]

export const DEMO_RECENT_EVENTS = [
  {
    timestamp: '14:40:12',
    type: 'TASK_COMPLETED',
    node: 'NODE-03',
    message: 'Task #342 completed — 12,847 primes found in range [7.5M–8M]',
    severity: 'info',
  },
  {
    timestamp: '14:39:55',
    type: 'NODE_OFFLINE',
    node: 'NODE-04',
    message: 'NODE-04 missed heartbeat threshold — marked OFFLINE',
    severity: 'warning',
  },
  {
    timestamp: '14:39:30',
    type: 'TASK_REASSIGNED',
    node: 'NODE-03',
    message: 'Task #319 reassigned from NODE-04 to NODE-03 after failure detection',
    severity: 'warning',
  },
  {
    timestamp: '14:38:02',
    type: 'TASK_ASSIGNED',
    node: 'NODE-01',
    message: 'Task #345 assigned to NODE-01 (lowest load score: 73.2)',
    severity: 'info',
  },
  {
    timestamp: '14:37:15',
    type: 'HEARTBEAT',
    node: 'NODE-02',
    message: 'Backup node NODE-02 heartbeat acknowledged by master',
    severity: 'success',
  },
  {
    timestamp: '14:35:48',
    type: 'TASK_COMPLETED',
    node: 'NODE-01',
    message: 'Task #341 completed — 9,231 primes found in range [7M–7.5M]',
    severity: 'info',
  },
  {
    timestamp: '14:34:10',
    type: 'TASK_FAILED',
    node: 'NODE-04',
    message: 'Task #319 failed on NODE-04 — connection lost during execution',
    severity: 'error',
  },
]

export const DEMO_TASKS = [
  { taskId: 'T-345', rangeStart: 9000000, rangeEnd: 9400000, assignedNode: 'NODE-01', status: 'RUNNING', result: null, duration: '00:02:14' },
  { taskId: 'T-344', rangeStart: 8600000, rangeEnd: 9000000, assignedNode: 'NODE-03', status: 'RUNNING', result: null, duration: '00:02:31' },
  { taskId: 'T-343', rangeStart: 8200000, rangeEnd: 8600000, assignedNode: 'NODE-02', status: 'RUNNING', result: null, duration: '00:02:48' },
  { taskId: 'T-342', rangeStart: 7800000, rangeEnd: 8200000, assignedNode: 'NODE-03', status: 'COMPLETED', result: 11297, duration: '00:03:12' },
  { taskId: 'T-341', rangeStart: 7400000, rangeEnd: 7800000, assignedNode: 'NODE-01', status: 'COMPLETED', result: 10631, duration: '00:02:55' },
  { taskId: 'T-340', rangeStart: 7000000, rangeEnd: 7400000, assignedNode: 'NODE-02', status: 'COMPLETED', result: 9987, duration: '00:03:01' },
  { taskId: 'T-339', rangeStart: 6600000, rangeEnd: 7000000, assignedNode: 'NODE-03', status: 'COMPLETED', result: 9431, duration: '00:02:44' },
  { taskId: 'T-338', rangeStart: 6200000, rangeEnd: 6600000, assignedNode: 'NODE-01', status: 'COMPLETED', result: 8890, duration: '00:02:38' },
  { taskId: 'T-337', rangeStart: 5800000, rangeEnd: 6200000, assignedNode: 'NODE-04', status: 'FAILED', result: null, duration: '00:00:47' },
  { taskId: 'T-336', rangeStart: 5400000, rangeEnd: 5800000, assignedNode: 'NODE-03', status: 'COMPLETED', result: 7654, duration: '00:02:22' },
  { taskId: 'T-335', rangeStart: 5000000, rangeEnd: 5400000, assignedNode: 'NODE-02', status: 'COMPLETED', result: 7198, duration: '00:02:51' },
  { taskId: 'T-334', rangeStart: 4600000, rangeEnd: 5000000, assignedNode: 'NODE-01', status: 'COMPLETED', result: 6742, duration: '00:02:35' },
]

export const DEMO_LOAD_BALANCING = [
  {
    nodeId: 'NODE-01',
    role: 'MASTER',
    cpuUsage: 73.2,
    activeTasks: 6,
    loadScore: 73.2 + 6 * 10,
    assignedTo: null,
  },
  {
    nodeId: 'NODE-02',
    role: 'BACKUP',
    cpuUsage: 41.8,
    activeTasks: 4,
    loadScore: 41.8 + 4 * 10,
    assignedTo: null,
  },
  {
    nodeId: 'NODE-03',
    role: 'WORKER',
    cpuUsage: 88.5,
    activeTasks: 8,
    loadScore: 88.5 + 8 * 10,
    assignedTo: null,
  },
  {
    nodeId: 'NODE-04',
    role: 'WORKER',
    cpuUsage: 0,
    activeTasks: 0,
    loadScore: 0,
    assignedTo: null,
  },
]

export const DEMO_ASSIGNMENT_DECISIONS = [
  {
    time: '14:40:02',
    taskId: 'T-345',
    selectedNode: 'NODE-01',
    reason: 'Lowest load score (73.2) among online nodes with capacity',
    candidates: [
      { node: 'NODE-01', loadScore: 73.2, selected: true },
      { node: 'NODE-02', loadScore: 81.8, selected: false },
      { node: 'NODE-03', loadScore: 168.5, selected: false },
    ],
  },
  {
    time: '14:38:45',
    taskId: 'T-344',
    selectedNode: 'NODE-03',
    reason: 'NODE-03 selected — weighted round-robin override after 3 consecutive assignments to NODE-01',
    candidates: [
      { node: 'NODE-01', loadScore: 93.2, selected: false },
      { node: 'NODE-02', loadScore: 71.8, selected: false },
      { node: 'NODE-03', loadScore: 78.5, selected: true },
    ],
  },
  {
    time: '14:37:20',
    taskId: 'T-343',
    selectedNode: 'NODE-02',
    reason: 'Lowest load score (41.8) — backup node available for computation',
    candidates: [
      { node: 'NODE-01', loadScore: 105.2, selected: false },
      { node: 'NODE-02', loadScore: 41.8, selected: true },
      { node: 'NODE-03', loadScore: 128.5, selected: false },
    ],
  },
]

export const DEMO_TASK_DISTRIBUTION_WORKERS = [
  { node: 'NODE-01', assigned: 6, completed: 92, failed: 0 },
  { node: 'NODE-02', assigned: 4, completed: 78, failed: 1 },
  { node: 'NODE-03', assigned: 8, completed: 105, failed: 0 },
  { node: 'NODE-04', assigned: 0, completed: 67, failed: 1 },
]

export const DEMO_FAULT_TOLERANCE = {
  primaryNode: 'NODE-01',
  backupNode: 'NODE-02',
  primaryStatus: 'ACTIVE',
  backupStatus: 'STANDBY',
  lastSync: '14:39:22',
  recoveryEvents: [
    {
      timestamp: '14:39:30',
      type: 'TASK_REASSIGNMENT',
      description: '3 tasks from NODE-04 reassigned to NODE-03 (lowest current load)',
      recoveredTasks: 3,
      fromNode: 'NODE-04',
      toNode: 'NODE-03',
    },
    {
      timestamp: '14:34:10',
      type: 'NODE_FAILURE',
      description: 'NODE-04 detected as failed — heartbeat timeout exceeded (30s threshold)',
      recoveredTasks: 3,
      fromNode: 'NODE-04',
      toNode: null,
    },
    {
      timestamp: '12:15:43',
      type: 'MASTER_FAILOVER',
      description: 'Master NODE-01 recovered from temporary network partition — backup NODE-02 relinquished master role',
      recoveredTasks: 0,
      fromNode: 'NODE-02',
      toNode: 'NODE-01',
    },
  ],
  failedNodes: ['NODE-04'],
}

export const DEMO_ELECTION_EVENTS = [
  {
    eventId: 'ELEC-003',
    timestamp: '14:39:35',
    initiator: 'NODE-03',
    type: 'RING_ELECTION',
    messages: [
      { from: 'NODE-03', to: 'NODE-04', content: 'ELECTION(3)', status: 'FAILED' },
      { from: 'NODE-03', to: 'NODE-01', content: 'ELECTION(3)', status: 'DELIVERED' },
      { from: 'NODE-01', to: 'NODE-02', content: 'ELECTION(3,1)', status: 'DELIVERED' },
      { from: 'NODE-02', to: 'NODE-03', content: 'ELECTION(3,1,2)', status: 'DELIVERED' },
      { from: 'NODE-03', to: 'NODE-01', content: 'COORDINATOR(3)', status: 'DELIVERED' },
    ],
    electedCoordinator: 'NODE-03',
    duration: '1.2s',
    reason: 'Triggered by NODE-04 failure detection',
  },
  {
    eventId: 'ELEC-002',
    timestamp: '12:15:38',
    initiator: 'NODE-02',
    type: 'RING_ELECTION',
    messages: [
      { from: 'NODE-02', to: 'NODE-03', content: 'ELECTION(2)', status: 'DELIVERED' },
      { from: 'NODE-03', to: 'NODE-04', content: 'ELECTION(2,3)', status: 'DELIVERED' },
      { from: 'NODE-04', to: 'NODE-01', content: 'ELECTION(2,3,4)', status: 'FAILED' },
      { from: 'NODE-03', to: 'NODE-01', content: 'ELECTION(2,3)', status: 'DELIVERED' },
      { from: 'NODE-01', to: 'NODE-02', content: 'COORDINATOR(1)', status: 'DELIVERED' },
    ],
    electedCoordinator: 'NODE-01',
    duration: '0.9s',
    reason: 'Triggered by master NODE-01 network partition',
  },
  {
    eventId: 'ELEC-001',
    timestamp: '09:00:12',
    initiator: 'NODE-01',
    type: 'RING_ELECTION',
    messages: [
      { from: 'NODE-01', to: 'NODE-02', content: 'ELECTION(1)', status: 'DELIVERED' },
      { from: 'NODE-02', to: 'NODE-03', content: 'ELECTION(1,2)', status: 'DELIVERED' },
      { from: 'NODE-03', to: 'NODE-04', content: 'ELECTION(1,2,3)', status: 'DELIVERED' },
      { from: 'NODE-04', to: 'NODE-01', content: 'ELECTION(1,2,3,4)', status: 'DELIVERED' },
      { from: 'NODE-01', to: 'NODE-02', content: 'COORDINATOR(1)', status: 'DELIVERED' },
      { from: 'NODE-02', to: 'NODE-03', content: 'COORDINATOR(1)', status: 'DELIVERED' },
      { from: 'NODE-03', to: 'NODE-04', content: 'COORDINATOR(1)', status: 'DELIVERED' },
    ],
    electedCoordinator: 'NODE-01',
    duration: '1.5s',
    reason: 'Initial cluster startup election',
  },
]

export const DEMO_ELECTION_LOG = [
  { timestamp: '14:39:35', event: 'Election started', detail: 'NODE-03 initiated ring election after NODE-04 failure', level: 'info' },
  { timestamp: '14:39:35', event: 'ELECTION message', detail: 'NODE-03 → NODE-04: FAILED (node offline)', level: 'warning' },
  { timestamp: '14:39:35', event: 'ELECTION message', detail: 'NODE-03 → NODE-01: ELECTION(3) delivered', level: 'info' },
  { timestamp: '14:39:36', event: 'ELECTION message', detail: 'NODE-01 → NODE-02: ELECTION(3,1) delivered', level: 'info' },
  { timestamp: '14:39:36', event: 'ELECTION message', detail: 'NODE-02 → NODE-03: ELECTION(3,1,2) delivered', level: 'info' },
  { timestamp: '14:39:36', event: 'Coordinator elected', detail: 'NODE-03 elected as coordinator (highest ID in election ring)', level: 'success' },
  { timestamp: '14:39:36', event: 'COORDINATOR message', detail: 'NODE-03 → NODE-01: COORDINATOR(3) delivered', level: 'info' },
  { timestamp: '14:39:36', event: 'Election completed', detail: 'ELEC-003 completed in 1.2s', level: 'success' },
]

// Experiment Results — NO BENCHMARK DATA INJECTED.
// The backend must supply real measurements. The UI shows the
// table structure and waiting state until data is available.
export const DEMO_EXPERIMENT_STRUCTURE = [
  { numComputers: 1, nodes: ['NODE-01'] },
  { numComputers: 2, nodes: ['NODE-01', 'NODE-02'] },
  { numComputers: 3, nodes: ['NODE-01', 'NODE-02', 'NODE-03'] },
  { numComputers: 4, nodes: ['NODE-01', 'NODE-02', 'NODE-03', 'NODE-04'] },
]
