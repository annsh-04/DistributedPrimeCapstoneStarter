package com.capstone.cluster.service;

import com.capstone.cluster.rmi.NodeRemote;
import com.capstone.cluster.rmi.NodeSnapshot;
import com.capstone.cluster.rmi.TaskReplica;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.rmi.Naming;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ClusterService
{
    private final Environment environment;
    private final ExecutorService executor = Executors.newFixedThreadPool(32);
    private final Map<String, Job> jobs = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> events = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> decisions = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> elections = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> electionLog = new CopyOnWriteArrayList<>();
    private final List<Map<String, Object>> benchmarks = new CopyOnWriteArrayList<>();
    private final AtomicInteger nextJob = new AtomicInteger(1);
    private final AtomicInteger logicalClock = new AtomicInteger(0);
    private volatile int coordinatorId = 1;
    private volatile int simulatedOfflineNode = -1;
    private volatile List<Map<String, Object>> cpuHistory = new CopyOnWriteArrayList<>();

    public ClusterService(Environment environment)
    {
        this.environment = environment;
        addEvent("SYSTEM_READY", "API gateway started; waiting for configured RMI nodes", "API", "info");
    }

    private String host(int id) { return environment.getProperty("cluster.node." + id + ".host", "").trim(); }
    private int registryPort(int id) { return environment.getProperty("cluster.node." + id + ".registry-port", Integer.class, 1099); }
    private String label(int id) { return String.format("NODE-%02d", id); }

    private NodeRemote remote(int id)
    {
        if (id == simulatedOfflineNode) return null;
        String host = host(id);
        if (host.isBlank() || host.startsWith("REPLACE_")) return null;
        try { return (NodeRemote) Naming.lookup("rmi://" + host + ":" + registryPort(id) + "/Node" + id); }
        catch (Exception e) { return null; }
    }

    public List<Map<String, Object>> nodes()
    {
        List<Map<String, Object>> result = new ArrayList<>();
        int count = environment.getProperty("cluster.node-count", Integer.class, 4);
        for (int id = 1; id <= count; id++)
        {
            NodeSnapshot s = null;
            NodeRemote r = remote(id);
            if (r != null) try { s = r.getStatus(); } catch (Exception ignored) {}
            boolean online = s != null;
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("nodeId", label(id));
            n.put("id", id);
            n.put("ipAddress", host(id).isBlank() ? "NOT_CONFIGURED" : host(id));
            n.put("role", s != null ? s.role : (id == coordinatorId ? "MASTER" : (id == 2 ? "BACKUP" : "WORKER")));
            n.put("status", online ? "ONLINE" : "OFFLINE");
            n.put("cpuUsage", online ? round(s.cpuUsage) : 0);
            n.put("memoryUsage", online ? round(s.memoryUsage) : 0);
            n.put("activeTasks", online ? s.activeTasks : 0);
            n.put("logicalClock", online ? s.logicalClock : 0);
            n.put("lastHeartbeat", online ? "just now" : "unreachable");
            n.put("lastHeartbeatEpoch", online ? s.lastHeartbeat : 0);
            n.put("isBackup", id == 2 && id != coordinatorId);
            result.add(n);
        }
        return result;
    }

    private double round(double n) { return Math.round(n * 10.0) / 10.0; }

    public Map<String, Object> clusterStatus()
    {
        List<Map<String, Object>> ns = nodes();
        int online = 0, active = 0;
        double cpu = 0, memory = 0;
        for (Map<String, Object> n : ns)
        {
            if ("ONLINE".equals(n.get("status"))) online++;
            active += (int)n.get("activeTasks");
            cpu += (double)n.get("cpuUsage");
            memory += (double)n.get("memoryUsage");
        }
        Job job = latestJob();
        int waiting = 0, completed = 0, failed = 0, running = 0, primes = 0;
        if (job != null) for (TaskState t : job.tasks)
        {
            if (t.status.equals("WAITING")) waiting++;
            if (t.status.equals("RUNNING")) running++;
            if (t.status.equals("COMPLETED")) { completed++; primes += t.result; }
            if (t.status.equals("FAILED")) failed++;
        }
        double progress = job == null || job.tasks.isEmpty() ? 0 : 100.0 * completed / job.tasks.size();
        long elapsed = job == null ? 0 : (System.currentTimeMillis() - job.startedAt) / 1000;
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", online == 0 ? "DISCONNECTED" : (online == ns.size() ? "OPERATIONAL" : "DEGRADED"));
        out.put("masterNode", label(coordinatorId));
        out.put("backupNode", label(coordinatorId == 2 ? 1 : 2));
        out.put("onlineNodes", online); out.put("offlineNodes", ns.size() - online); out.put("totalNodes", ns.size());
        out.put("avgCpuUsage", online == 0 ? 0 : round(cpu / online));
        out.put("avgMemoryUsage", online == 0 ? 0 : round(memory / online));
        out.put("activeTasks", running); out.put("waitingTasks", waiting); out.put("completedTasks", completed); out.put("failedTasks", failed);
        out.put("totalPrimesFound", primes); out.put("jobExecutionTime", String.format("%02d:%02d:%02d", elapsed / 3600, (elapsed % 3600) / 60, elapsed % 60));
        out.put("jobProgress", round(progress));
        return out;
    }

    public List<Map<String, Object>> cpuHistory()
    {
        List<Map<String, Object>> row = new ArrayList<>();
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("time", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        for (Map<String, Object> n : nodes()) entry.put("NODE" + String.format("%02d", n.get("id")), n.get("cpuUsage"));
        cpuHistory.add(entry);
        while (cpuHistory.size() > 20) cpuHistory.remove(0);
        return new ArrayList<>(cpuHistory);
    }

    public List<Map<String, Object>> taskDistribution()
    {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> n : nodes()) result.add(Map.of("node", n.get("nodeId"), "tasks", n.get("activeTasks"), "cpu", n.get("cpuUsage")));
        return result;
    }

    public List<Map<String, Object>> recentEvents() { return new ArrayList<>(events); }
    private void addEvent(String type, String message, String node, String severity)
    {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("timestamp", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        e.put("type", type); e.put("message", message); e.put("node", node); e.put("severity", severity);
        events.add(0, e); while (events.size() > 300) events.remove(events.size() - 1);
    }

    public Map<String, Object> startJob(Map<String, Object> request)
    {
        int start = number(request, "rangeStart", 1), end = number(request, "rangeEnd", 10_000_000), count = number(request, "numTasks", 24);
        if (start < 1 || end < start || end > 100_000_000 || count < 1 || count > 500)
            throw new IllegalArgumentException("Use rangeStart >= 1, rangeEnd >= rangeStart and 1–500 tasks; maximum end is 100,000,000.");
        List<Integer> workers = liveWorkerIds();
        if (workers.isEmpty()) throw new IllegalStateException("No configured RMI nodes are reachable. Configure IP addresses and start NodeAgent on the worker computers first.");
        String id = "JOB-" + String.format("%04d", nextJob.getAndIncrement());
        Job job = new Job(id, start, end, count, workers.size());
        jobs.put(id, job);
        addEvent("JOB_STARTED", id + " started for range " + start + "–" + end + " using " + count + " tasks", label(coordinatorId), "info");
        int length = end - start + 1;
        int chunk = (length + count - 1) / count;
        for (int i = 0; i < count; i++)
        {
            int lo = start + i * chunk;
            int hi = Math.min(end, lo + chunk - 1);
            if (lo > end) break;
            job.tasks.add(new TaskState(i + 1, lo, hi));
        }
        for (TaskState task : job.tasks) replicateTask(job, task);
        for (TaskState task : job.tasks) executor.submit(() -> runTask(job, task));
        return Map.of("jobId", id, "status", "RUNNING", "rangeStart", start, "rangeEnd", end, "numTasks", job.tasks.size(), "message", "Job accepted; RMI workers are processing tasks.");
    }

    private int number(Map<String, Object> map, String key, int fallback)
    {
        Object v = map.get(key);
        if (v instanceof Number) return ((Number)v).intValue();
        if (v instanceof String text)
        {
            try
            {
                if (text.matches("(?i)NODE-\\d+")) return Integer.parseInt(text.substring(text.lastIndexOf('-') + 1));
                return Integer.parseInt(text.trim());
            }
            catch (NumberFormatException ignored) { return fallback; }
        }
        return fallback;
    }

    private List<Integer> liveWorkerIds()
    {
        List<Integer> ids = new ArrayList<>();
        int count = environment.getProperty("cluster.node-count", Integer.class, 4);
        for (int id = 1; id <= count; id++) if (remote(id) != null) ids.add(id);
        return ids;
    }

    private void runTask(Job job, TaskState task)
    {
        if (job.cancelled) { task.status = "CANCELLED"; return; }
        while (job.paused && !job.cancelled) try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        if (job.cancelled) { task.status = "CANCELLED"; return; }
        NodeChoice choice = chooseNode(task.triedNodes);
        if (choice == null) { task.status = "FAILED"; task.durationMs = 0; addEvent("TASK_FAILED", "Task " + task.id + " failed: no reachable worker", "API", "error"); return; }
        task.triedNodes.add(choice.id);
        task.status = "RUNNING"; task.assignedNode = label(choice.id); task.startedAt = System.currentTimeMillis();
        synchronized (job) { job.assignments.merge(choice.id, 1, Integer::sum); }
        replicateTask(job, task);
        Map<String, Object> decision = new LinkedHashMap<>();
        decision.put("time", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))); decision.put("taskId", "T-" + task.id);
        decision.put("selectedNode", label(choice.id)); decision.put("reason", "Lowest observed load score: " + round(choice.loadScore));
        decision.put("candidates", choice.candidates); decisions.add(0, decision); while (decisions.size() > 100) decisions.remove(decisions.size() - 1);
        addEvent("TASK_ASSIGNED", "Task " + task.id + " assigned to " + label(choice.id), label(choice.id), "info");
        try
        {
            NodeRemote r = remote(choice.id);
            if (r == null) throw new IllegalStateException("Worker went offline before task execution");
            task.result = r.countPrimes(task.start, task.end, task.id);
            task.status = "COMPLETED";
            task.durationMs = System.currentTimeMillis() - task.startedAt;
            task.completedAt = System.currentTimeMillis();
            replicateTask(job, task);
            addEvent("TASK_COMPLETED", "Task " + task.id + " completed; " + task.result + " primes found on " + label(choice.id), label(choice.id), "success");
            synchronized (job) { if (job.tasks.stream().allMatch(t -> t.status.equals("COMPLETED"))) finishJob(job); }
        }
        catch (Exception ex)
        {
            task.durationMs = System.currentTimeMillis() - task.startedAt;
            addEvent("WORKER_FAILURE", "Task " + task.id + " could not finish on " + label(choice.id) + ": " + ex.getMessage(), label(choice.id), "warning");
            if (task.triedNodes.size() < liveWorkerIds().size() && !job.cancelled)
            {
                task.status = "WAITING";
                replicateTask(job, task);
                addEvent("TASK_REASSIGNED", "Task " + task.id + " returned to queue for another reachable worker", label(choice.id), "warning");
                executor.submit(() -> runTask(job, task));
            }
            else
            {
                task.status = "FAILED";
                replicateTask(job, task);
                addEvent("TASK_FAILED", "Task " + task.id + " failed after trying reachable workers", label(choice.id), "error");
            }
        }
    }


    private void replicateTask(Job job, TaskState task)
    {
        TaskReplica replica = new TaskReplica(job.id, task.id, task.start, task.end, task.status,
                task.result, task.assignedNode == null ? "" : task.assignedNode,
                logicalClock.incrementAndGet(), System.currentTimeMillis());
        for (int id : liveWorkerIds())
        {
            NodeRemote r = remote(id);
            if (r != null) try { r.replicateTask(replica); } catch (Exception ignored) {}
        }
    }

    private NodeChoice chooseNode(Set<Integer> excluded)
    {
        List<Map<String, Object>> candidates = new ArrayList<>();
        NodeChoice best = null;
        for (int id : liveWorkerIds())
        {
            if (excluded.contains(id)) continue;
            NodeRemote r = remote(id);
            try
            {
                NodeSnapshot s = r.getStatus();
                double score = s.cpuUsage + s.activeTasks * 10.0;
                Map<String, Object> c = new LinkedHashMap<>(); c.put("node", label(id)); c.put("loadScore", round(score)); c.put("selected", false);
                candidates.add(c);
                if (best == null || score < best.loadScore) best = new NodeChoice(id, score, candidates);
            }
            catch (Exception ignored) {}
        }
        if (best != null)
        {
            for (Map<String, Object> c : candidates) c.put("selected", c.get("node").equals(label(best.id)));
            best.candidates = candidates;
        }
        return best;
    }

    private void finishJob(Job job)
    {
        if (job.finishedAt != 0) return;
        job.finishedAt = System.currentTimeMillis();
        long duration = Math.max(1, job.finishedAt - job.startedAt);
        int primes = job.tasks.stream().mapToInt(t -> t.result).sum();
        Map<String, Object> b = new LinkedHashMap<>(); b.put("jobId", job.id); b.put("numComputers", job.computerCount); b.put("rangeEnd", job.end);
        b.put("executionTimeSeconds", round(duration / 1000.0)); b.put("totalPrimes", primes); b.put("measuredAt", LocalTime.now().toString());
        benchmarks.add(b);
        addEvent("JOB_COMPLETED", job.id + " completed in " + round(duration / 1000.0) + " seconds; total primes=" + primes, label(coordinatorId), "success");
    }

    public List<Map<String, Object>> tasks(String jobId)
    {
        Job job = jobs.get(jobId); if (job == null) throw new NoSuchElementException("Unknown job ID: " + jobId);
        List<Map<String, Object>> out = new ArrayList<>();
        for (TaskState t : job.tasks)
        {
            Map<String, Object> m = new LinkedHashMap<>(); m.put("taskId", "T-" + t.id); m.put("id", t.id); m.put("rangeStart", t.start); m.put("rangeEnd", t.end);
            m.put("assignedNode", t.assignedNode == null ? "—" : t.assignedNode); m.put("status", t.status); m.put("result", t.result);
            m.put("duration", t.durationMs == 0 ? "—" : String.format("%02d:%02d", t.durationMs / 60000, (t.durationMs / 1000) % 60)); m.put("durationMs", t.durationMs);
            out.add(m);
        }
        return out;
    }

    public Map<String, Object> job(String jobId)
    {
        Job j = jobs.get(jobId); if (j == null) throw new NoSuchElementException("Unknown job ID: " + jobId);
        long completed = j.tasks.stream().filter(t -> t.status.equals("COMPLETED")).count();
        long failed = j.tasks.stream().filter(t -> t.status.equals("FAILED")).count();
        long running = j.tasks.stream().filter(t -> t.status.equals("RUNNING")).count();
        long waiting = j.tasks.stream().filter(t -> t.status.equals("WAITING")).count();
        String status = j.cancelled ? "CANCELLED" : j.paused ? "PAUSED" : failed > 0 && completed + failed == j.tasks.size() ? "FAILED" : completed == j.tasks.size() ? "COMPLETED" : "RUNNING";
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("jobId", j.id); result.put("status", status); result.put("rangeStart", j.start); result.put("rangeEnd", j.end);
        result.put("numTasks", j.tasks.size()); result.put("completedTasks", completed); result.put("failedTasks", failed);
        result.put("runningTasks", running); result.put("waitingTasks", waiting);
        result.put("progress", j.tasks.isEmpty() ? 0 : round(100.0 * completed / j.tasks.size()));
        result.put("elapsedSeconds", (System.currentTimeMillis() - j.startedAt) / 1000);
        return result;
    }

    public Map<String, Object> controlJob(String jobId, String action)
    {
        Job j = jobs.get(jobId); if (j == null) throw new NoSuchElementException("Unknown job ID: " + jobId);
        if (action.equals("pause")) j.paused = true;
        else if (action.equals("resume")) j.paused = false;
        else if (action.equals("cancel")) j.cancelled = true;
        addEvent("JOB_" + action.toUpperCase(), jobId + " " + action + " requested", label(coordinatorId), "warning");
        return job(jobId);
    }

    public List<Map<String, Object>> loadBalancing()
    {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> n : nodes())
        {
            double cpu = (double)n.get("cpuUsage"); int active = (int)n.get("activeTasks");
            result.add(Map.of("nodeId", n.get("nodeId"), "role", n.get("role"), "cpuUsage", cpu, "activeTasks", active, "loadScore", round(cpu + active * 10.0), "assignedTo", "—"));
        }
        return result;
    }
    public List<Map<String, Object>> decisions() { return new ArrayList<>(decisions); }

    public Map<String, Object> faultStatus()
    {
        return Map.of("primaryNode", label(coordinatorId), "backupNode", label(coordinatorId == 2 ? 1 : 2),
                "primaryStatus", remote(coordinatorId) == null ? "UNREACHABLE" : "ACTIVE", "backupStatus", remote(coordinatorId == 2 ? 1 : 2) == null ? "UNREACHABLE" : "STANDBY",
                "lastSync", "live status poll", "recoveryEvents", events.stream().filter(e -> String.valueOf(e.get("type")).contains("FAIL") || String.valueOf(e.get("type")).contains("RECOVER") || String.valueOf(e.get("type")).contains("ELECTION")).limit(30).toList(),
                "failedNodes", nodes().stream().filter(n -> n.get("status").equals("OFFLINE")).map(n -> n.get("nodeId")).toList());
    }

    public Map<String, Object> simulateFailure(Map<String, Object> body)
    {
        int id = number(body, "nodeId", -1);
        if (id < 1 || id > environment.getProperty("cluster.node-count", Integer.class, 4)) throw new IllegalArgumentException("nodeId must identify a configured node.");
        simulatedOfflineNode = id;
        addEvent("NODE_FAILURE_SIMULATED", "Node " + label(id) + " excluded from coordinator health checks. This is a control-plane simulation; it does not power off the computer.", label(id), "warning");
        if (id == coordinatorId)
        {
            int winner = -1;
            for (int candidate : liveWorkerIds()) if (candidate > winner) winner = candidate;
            if (winner > 0)
            {
                coordinatorId = winner;
                for (int candidate : liveWorkerIds()) try { remote(candidate).setCoordinator(winner); } catch (Exception ignored) {}
                addEvent("RING_ELECTION_COMPLETED", "Highest-ID reachable node " + label(winner) + " selected as coordinator by simulated ring election", label(winner), "success");
                List<Map<String, Object>> messages = new ArrayList<>();
                List<Integer> ring = liveWorkerIds();
                for (int i = 0; i < ring.size(); i++)
                {
                    int from = ring.get(i);
                    int to = ring.get((i + 1) % ring.size());
                    messages.add(Map.of("from", label(from), "to", label(to), "content", "ELECTION(" + winner + ")", "status", "DELIVERED"));
                }
                for (int node : ring) messages.add(Map.of("from", label(winner), "to", label(node), "content", "COORDINATOR(" + winner + ")", "status", "DELIVERED"));
                Map<String, Object> ev = new LinkedHashMap<>(); ev.put("eventId", "ELEC-" + System.currentTimeMillis()); ev.put("timestamp", LocalTime.now().toString()); ev.put("initiator", label(winner)); ev.put("type", "RING_ELECTION"); ev.put("messages", messages); ev.put("electedCoordinator", label(winner)); ev.put("duration", "simulated"); ev.put("reason", "Control-plane failure simulation"); elections.add(0, ev);
                electionLog.add(0, Map.of("timestamp", LocalTime.now().toString(), "event", "Coordinator elected", "detail", label(winner) + " selected in control-plane simulation; this is not a distributed consensus protocol.", "level", "warning"));
            }
        }
        return Map.of("accepted", true, "nodeId", id, "message", "Node excluded from API health polling until reset.", "warning", "This does not physically stop the node process.");
    }

    public List<Map<String, Object>> electionEvents() { return new ArrayList<>(elections); }
    public List<Map<String, Object>> electionLog() { return new ArrayList<>(electionLog); }
    public List<Map<String, Object>> experiments() { return new ArrayList<>(benchmarks); }
    public Map<String, Object> resetSimulation()
    {
        simulatedOfflineNode = -1;
        addEvent("SIMULATION_RESET", "Control-plane failure simulation cleared", "API", "info");
        return Map.of("status", "RESET", "message", "Failure simulation cleared. Real node connectivity was not changed.");
    }

    private Job latestJob() { return jobs.values().stream().max(Comparator.comparingInt(j -> Integer.parseInt(j.id.substring(4)))).orElse(null); }

    private static class NodeChoice
    {
        int id; double loadScore; List<Map<String, Object>> candidates;
        NodeChoice(int id, double loadScore, List<Map<String, Object>> candidates) { this.id = id; this.loadScore = loadScore; this.candidates = candidates; }
    }
    private static class TaskState
    {
        int id, start, end, result; String status = "WAITING", assignedNode; long startedAt, completedAt, durationMs;
        Set<Integer> triedNodes = ConcurrentHashMap.newKeySet();
        TaskState(int id, int start, int end) { this.id = id; this.start = start; this.end = end; }
    }
    private static class Job
    {
        String id; int start, end, computerCount; List<TaskState> tasks = new CopyOnWriteArrayList<>(); Map<Integer, Integer> assignments = new ConcurrentHashMap<>();
        long startedAt = System.currentTimeMillis(), finishedAt; volatile boolean paused, cancelled;
        Job(String id, int start, int end, int count, int computers) { this.id = id; this.start = start; this.end = end; this.computerCount = computers; }
    }
}
