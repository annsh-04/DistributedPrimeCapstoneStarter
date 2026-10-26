package com.capstone.cluster.rmi;

import java.io.Serializable;

public class NodeSnapshot implements Serializable
{
    private static final long serialVersionUID = 1L;
    public int id;
    public String host;
    public String status;
    public double cpuUsage;
    public double memoryUsage;
    public int activeTasks;
    public int logicalClock;
    public long lastHeartbeat;
    public String role;

    public NodeSnapshot(int id, String host, String status, double cpuUsage, double memoryUsage,
                        int activeTasks, int logicalClock, long lastHeartbeat, String role)
    {
        this.id = id;
        this.host = host;
        this.status = status;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.activeTasks = activeTasks;
        this.logicalClock = logicalClock;
        this.lastHeartbeat = lastHeartbeat;
        this.role = role;
    }
}
