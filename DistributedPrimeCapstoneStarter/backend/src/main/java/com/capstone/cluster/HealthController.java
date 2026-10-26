package com.capstone.cluster;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController
{
    @GetMapping("/health")
    public Map<String, Object> health()
    {
        return Map.of(
            "status", "UP",
            "service", "distributed-prime-api",
            "integrationStatus", "RMI_API_IMPLEMENTED",
            "message", "API is running. Check /api/nodes to verify configured RMI node reachability."
        );
    }
}
