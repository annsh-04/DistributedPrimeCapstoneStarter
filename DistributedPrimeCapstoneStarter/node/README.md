# Java RMI Node Services — implementation starts here

This folder is reserved for the Java RMI node service source files. The frontend archive supplied by Bolt does not include Java node services, and this starter deliberately does not pretend the cluster is already implemented.

Planned first Java files:
- NodeService.java — RMI remote interface
- NodeServiceImpl.java — worker status, prime task execution, task state, logical clock
- NodeServer.java — starts registry and binds node service
- ClusterConfig.java — reads shared node IP/port configuration
- ClusterClient.java — submits tasks and queries node status

The Spring Boot backend must call these RMI services after the node layer is implemented. Add all Java files here before treating the capstone as functional.
