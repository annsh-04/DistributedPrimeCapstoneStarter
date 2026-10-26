package com.capstone.cluster.rmi;

import java.io.Serializable;

public class TaskReplica implements Serializable
{
    private static final long serialVersionUID = 1L;
    public String jobId;
    public int taskId;
    public int rangeStart;
    public int rangeEnd;
    public String status;
    public int result;
    public String assignedNode;
    public int logicalClock;
    public long updatedAt;

    public TaskReplica(String jobId, int taskId, int rangeStart, int rangeEnd, String status,
                       int result, String assignedNode, int logicalClock, long updatedAt)
    {
        this.jobId = jobId;
        this.taskId = taskId;
        this.rangeStart = rangeStart;
        this.rangeEnd = rangeEnd;
        this.status = status;
        this.result = result;
        this.assignedNode = assignedNode;
        this.logicalClock = logicalClock;
        this.updatedAt = updatedAt;
    }
}
