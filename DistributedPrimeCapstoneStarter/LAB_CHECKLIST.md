# Lab Checklist — Distributed Prime Capstone

## Before starting
- [ ] Extract the ZIP on the API/control computer.
- [ ] Install JDK 17+ on all nodes and Maven on the API host.
- [ ] Install Node.js 20+ and npm on the frontend computer.
- [ ] Run `hostname` and `hostname -I` on each node and record actual IPv4 addresses.
- [ ] Confirm the computers are on a reachable network; test with `ping -c 4 <IP>`.
- [ ] Decide which computer will host Spring Boot. Keep it separate from the node to be powered off during the master-failure demonstration.

## Build and configure
- [ ] Run `cd backend && mvn -DskipTests package`.
- [ ] From project root, run `./scripts/configure-cluster.sh <node1-ip> <node2-ip> <node3-ip> <node4-ip>`.
- [ ] Review `backend/src/main/resources/application.properties`.
- [ ] Ensure TCP 1099 and 5000 are allowed between the API host and node computers; TCP 8080 is allowed from the browser computer.

## Start node agents
- [ ] Run `./scripts/start-node.sh 1 <node1-ip>` on node 1.
- [ ] Run `./scripts/start-node.sh 2 <node2-ip>` on node 2.
- [ ] Run `./scripts/start-node.sh 3 <node3-ip>` on node 3.
- [ ] Run `./scripts/start-node.sh 4 <node4-ip>` on node 4.
- [ ] Leave all node terminals open.
- [ ] Start API with `cd backend && mvn spring-boot:run`.
- [ ] Verify `http://<api-host-ip>:8080/api/health`.
- [ ] Open frontend and save `http://<api-host-ip>:8080/api` in Settings.
- [ ] Confirm Cluster Nodes shows reachable nodes as ONLINE.

## Test jobs
- [ ] Run range 1–10,000 with 4 tasks.
- [ ] Confirm prime count is 1,229.
- [ ] Run range 1–1,000,000 with 12 tasks; expected prime count is 78,498.
- [ ] Run range 1–10,000,000 with 24 tasks; expected prime count is 664,579.
- [ ] Confirm task assignment decisions reflect CPU + active-task score.
- [ ] Record actual execution times for each cluster size. Do not invent speedup values.

## Failure test caution
- [ ] The dashboard failure control is currently a control-plane simulation, not a physical shutdown or fully distributed consensus protocol.
- [ ] Test task retry by stopping one worker process while a long task is running, then observe whether the task is reassigned.
- [ ] Do not power off the computer hosting the API gateway during a live dashboard test.
- [ ] Do not claim durable primary-backup state recovery until that implementation is completed and verified.
