package com.capstone.cluster.api;

import com.capstone.cluster.service.ClusterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ClusterController
{
    private final ClusterService cluster;
    public ClusterController(ClusterService cluster) { this.cluster = cluster; }

    @GetMapping("/cluster/status") public Map<String, Object> status() { return cluster.clusterStatus(); }
    @GetMapping("/cluster/cpu-history") public List<Map<String, Object>> cpuHistory() { return cluster.cpuHistory(); }
    @GetMapping("/cluster/task-distribution") public List<Map<String, Object>> taskDistribution() { return cluster.taskDistribution(); }
    @GetMapping("/cluster/events") public List<Map<String, Object>> events() { return cluster.recentEvents(); }
    @GetMapping("/nodes") public List<Map<String, Object>> nodes() { return cluster.nodes(); }
    @GetMapping("/nodes/{id}") public Map<String, Object> node(@PathVariable int id)
    {
        return cluster.nodes().stream().filter(n -> ((Number)n.get("id")).intValue() == id).findFirst().orElseThrow(() -> new java.util.NoSuchElementException("Unknown node " + id));
    }
    @PostMapping("/jobs/start") public Map<String, Object> startJob(@RequestBody Map<String, Object> body) { return cluster.startJob(body); }
    @GetMapping("/jobs/{jobId}") public Map<String, Object> job(@PathVariable String jobId) { return cluster.job(jobId); }
    @GetMapping("/jobs/{jobId}/tasks") public List<Map<String, Object>> tasks(@PathVariable String jobId) { return cluster.tasks(jobId); }
    @PostMapping("/jobs/{jobId}/pause") public Map<String, Object> pause(@PathVariable String jobId) { return cluster.controlJob(jobId, "pause"); }
    @PostMapping("/jobs/{jobId}/resume") public Map<String, Object> resume(@PathVariable String jobId) { return cluster.controlJob(jobId, "resume"); }
    @PostMapping("/jobs/{jobId}/cancel") public Map<String, Object> cancel(@PathVariable String jobId) { return cluster.controlJob(jobId, "cancel"); }
    @GetMapping("/load-balancing/status") public List<Map<String, Object>> loadBalancing() { return cluster.loadBalancing(); }
    @GetMapping("/load-balancing/decisions") public List<Map<String, Object>> decisions() { return cluster.decisions(); }
    @GetMapping("/fault-tolerance/status") public Map<String, Object> faultStatus() { return cluster.faultStatus(); }
    @PostMapping("/fault-tolerance/simulate-failure") public Map<String, Object> simulateFailure(@RequestBody Map<String, Object> body) { return cluster.simulateFailure(body); }
    @PostMapping("/fault-tolerance/reset-simulation") public Map<String, Object> resetSimulation() { return cluster.resetSimulation(); }
    @GetMapping("/election/events") public List<Map<String, Object>> electionEvents() { return cluster.electionEvents(); }
    @GetMapping("/election/log") public List<Map<String, Object>> electionLog() { return cluster.electionLog(); }
    @GetMapping("/experiments/results") public List<Map<String, Object>> experiments() { return cluster.experiments(); }
}
