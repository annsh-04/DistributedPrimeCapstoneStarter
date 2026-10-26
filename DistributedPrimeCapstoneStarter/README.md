# Distributed Prime Capstone — Implementation Pack

Project: **Adaptive Load Balancing in a Distributed Computing Cluster Using Real-Time Node Monitoring**

This pack contains the Bolt React dashboard and an initial working Java RMI + Spring Boot implementation. The dashboard starts in DEMO mode. Save the API URL in Settings to switch it to live mode.

## Architecture

- React/Vite dashboard (`frontend/`) calls the Spring Boot REST API.
- Spring Boot (`backend/`) polls configured RMI node services, accepts jobs, schedules tasks by `CPU usage + activeTasks × 10`, tracks task status, and exposes metrics/events.
- Java RMI node agent (`com.capstone.cluster.rmi.NodeAgent`) runs on each configured computer. Each task is split over four Java threads on its assigned node.
- The API retries a failed task on another reachable node where possible.

## What is implemented in this pack

- Java RMI remote interface and node agent with real CPU/memory reporting, active-task count, logical clock, four-thread prime counting, ping, and coordinator field.
- REST endpoints used by the dashboard for cluster status, nodes, CPU history, task distribution, events, job start/status/tasks/pause/resume/cancel, load-balancing metrics/decisions, failure simulation, election history, and experiment measurements.
- Dynamic task assignment using measured node load and task retry when a reachable worker fails during execution.
- Job input validation, benchmark records after completed jobs, and explicit failure when no configured RMI workers are reachable.
- Task-state snapshots are replicated to reachable RMI nodes as work moves through WAITING/RUNNING/COMPLETED/FAILED states.
- Dashboard starts with labelled demo data until the API URL is explicitly saved.

## Important limitations — read before your presentation

This is an implementation baseline, not a production-grade fault-tolerant cluster. The failure button currently excludes a node from the API's health polling and demonstrates a control-plane election event; it does **not** power off the computer or run a fully distributed consensus protocol. Task state is currently held in the API process, so durable primary-backup replication and recovery after the API process itself crashes still need to be completed and tested before claiming full master-failure recovery. The experiment page records real completed-job measurements, but valid speedup comparisons require running the same range under each cluster size and recording each result.

The API gateway should run on a computer separate from the node you intend to power off during a master-failure demonstration. Do not stop the API host during that test.

## Requirements

- Java JDK 17 or newer on every computer
- Maven on the computer running the API
- Node.js 20+ and npm for the frontend
- All computers on a network that permits device-to-device TCP traffic

## Preview frontend

Linux:

```bash
./scripts/preview-frontend.sh
```

Windows: double-click `scripts/preview-frontend.bat`.

Or manually:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`. It should show DEMO DATA at first.

## Lab setup

### 1. Find IP addresses

On each Ubuntu computer:

```bash
hostname
hostname -I
java -version
```

Record each actual IPv4 address. Do not use example addresses.

### 2. Test reachability

From each computer, try `ping -c 4 <other-computer-ip>`. A blocked ping does not always mean TCP is blocked, but it is a useful first check.

### 3. Build the backend and node agent classes

On the computer that will host the API:

```bash
cd backend
mvn -DskipTests package
```

If Maven is missing on Ubuntu: `sudo apt update && sudo apt install maven`.

The resulting `backend/target/classes` includes the standalone RMI node agent class.

### 4. Configure the four node addresses

From the project root, run:

```bash
./scripts/configure-cluster.sh <node1-ip> <node2-ip> <node3-ip> <node4-ip>
```

Replace the placeholders with the real IPs. This writes `backend/src/main/resources/application.properties`; review it before proceeding. If you rerun Maven after changing properties, the packaged copy will also update.

### 5. Start one RMI node agent on each physical node

After building the backend, copy the project folder (or at minimum `backend/target/classes` and `scripts/start-node.sh`) to each node. From the project root on each machine run the matching command, replacing the IP with that machine's advertised IPv4 address:

```bash
./scripts/start-node.sh 1 <node1-ip>
./scripts/start-node.sh 2 <node2-ip>
./scripts/start-node.sh 3 <node3-ip>
./scripts/start-node.sh 4 <node4-ip>
```

Run exactly one command per physical computer. Leave each terminal open. Registry port is 1099 and remote object port is 5000. Node agents should not share the same physical host/ports unless intentionally testing a single node.

### 6. Start the API gateway

On the API host, with its configured `application.properties`:

```bash
cd backend
mvn spring-boot:run
```

Check `http://<api-host-ip>:8080/api/health`. The API binds to `0.0.0.0:8080` so other LAN devices can reach it. Keep the API host powered on while testing node failure.

### 7. Connect the dashboard

Open the dashboard, go to **Settings**, enter `http://<api-host-ip>:8080/api`, and click **Save**. Saving explicitly activates live mode. Visit Cluster Nodes; configured reachable RMI agents should appear online. If they are offline, check IPs, RMI ports, Java processes, and firewall rules.

### 8. Test progressively

1. Start with range 1–10,000 and 4 tasks.
2. Confirm completed task rows and the correct prime count.
3. Try 1–1,000,000 with 12 tasks.
4. Try 1–10,000,000 with 24 tasks after the small job succeeds.
5. Run the same workload at different reachable node counts and record measured times for the report.

## Ports and firewall

- TCP 1099: RMI registry
- TCP 5000: fixed RMI object port
- TCP 8080: Spring Boot API
- TCP 5173: Vite development server

Permit these ports only on the lab LAN as required. Do not expose RMI to the public internet. The API currently has no authentication and is intended only for a controlled lab network.

## API endpoints

- `GET /api/health`
- `GET /api/cluster/status`
- `GET /api/cluster/cpu-history`
- `GET /api/cluster/task-distribution`
- `GET /api/cluster/events`
- `GET /api/nodes`, `GET /api/nodes/{id}`
- `POST /api/jobs/start`
- `GET /api/jobs/{jobId}`, `GET /api/jobs/{jobId}/tasks`
- `POST /api/jobs/{jobId}/pause`, `/resume`, `/cancel`
- `GET /api/load-balancing/status`, `GET /api/load-balancing/decisions`
- `GET /api/fault-tolerance/status`
- `POST /api/fault-tolerance/simulate-failure`, `POST /api/fault-tolerance/reset-simulation`
- `GET /api/election/events`, `GET /api/election/log`
- `GET /api/experiments/results`

## Known frontend note

The dashboard remembers the active job ID in local storage. If the browser is cleared or the API process restarts, start a new job. The current job store is in memory, not durable storage.
