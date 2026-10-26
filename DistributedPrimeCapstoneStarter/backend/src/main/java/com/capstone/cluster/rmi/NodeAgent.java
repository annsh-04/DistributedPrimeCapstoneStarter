package com.capstone.cluster.rmi;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.net.InetAddress;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class NodeAgent extends UnicastRemoteObject implements NodeRemote
{
    private final int id;
    private final String host;
    private final AtomicInteger activeTasks = new AtomicInteger(0);
    private volatile int logicalClock = 0;
    private volatile int coordinatorId = 1;
    private volatile long lastHeartbeat = System.currentTimeMillis();
    private final Map<String, TaskReplica> replicatedTasks = new ConcurrentHashMap<>();

    public NodeAgent(int id, String host) throws java.rmi.RemoteException
    {
        super(5000);
        this.id = id;
        this.host = host;
    }

    public synchronized NodeSnapshot getStatus()
    {
        logicalClock++;
        lastHeartbeat = System.currentTimeMillis();
        OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();
        double cpu = 0;
        try
        {
            if (os instanceof com.sun.management.OperatingSystemMXBean bean)
                cpu = Math.max(0, bean.getCpuLoad() * 100.0);
        }
        catch (Exception ignored) {}
        Runtime rt = Runtime.getRuntime();
        double memory = 100.0 * (rt.totalMemory() - rt.freeMemory()) / Math.max(1, rt.maxMemory());
        String role = id == coordinatorId ? "MASTER" : (id == 2 ? "BACKUP" : "WORKER");
        return new NodeSnapshot(id, host, "ONLINE", Math.min(100, cpu), Math.min(100, memory),
                activeTasks.get(), logicalClock, lastHeartbeat, role);
    }

    public int countPrimes(int start, int end, int taskId)
    {
        activeTasks.incrementAndGet();
        synchronized (this) { logicalClock++; }
        try
        {
            int threadCount = 4;
            Thread[] threads = new Thread[threadCount];
            int[] results = new int[threadCount];
            int total = end - start + 1;
            int chunk = (total + threadCount - 1) / threadCount;
            for (int i = 0; i < threadCount; i++)
            {
                final int index = i;
                final int lo = start + i * chunk;
                final int hi = Math.min(end, lo + chunk - 1);
                threads[i] = new Thread(() ->
                {
                    int count = 0;
                    for (int n = lo; n <= hi; n++)
                        if (isPrime(n)) count++;
                    results[index] = count;
                }, "prime-task-" + taskId + "-" + i);
                threads[i].start();
            }
            for (Thread thread : threads)
            {
                try { thread.join(); }
                catch (InterruptedException e) { Thread.currentThread().interrupt(); throw new IllegalStateException(e); }
            }
            synchronized (this) { logicalClock++; }
            int count = 0;
            for (int value : results) count += value;
            return count;
        }
        finally
        {
            activeTasks.decrementAndGet();
            lastHeartbeat = System.currentTimeMillis();
        }
    }

    private boolean isPrime(int n)
    {
        if (n < 2) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
        for (int i = 3; i <= n / i; i += 2)
            if (n % i == 0) return false;
        return true;
    }

    public boolean ping() { return true; }
    public void setCoordinator(int coordinatorId) { this.coordinatorId = coordinatorId; }
    public int getNodeId() { return id; }
    public void replicateTask(TaskReplica task)
    {
        synchronized (this) { logicalClock = Math.max(logicalClock, task.logicalClock) + 1; }
        replicatedTasks.put(task.jobId + "-" + task.taskId, task);
    }
    public List<TaskReplica> getReplicatedTasks() { return new ArrayList<>(replicatedTasks.values()); }

    public static void main(String[] args) throws Exception
    {
        if (args.length < 2)
        {
            System.out.println("Usage: NodeAgent <nodeId> <advertisedIp> [registryPort=1099]");
            return;
        }
        int id = Integer.parseInt(args[0]);
        String host = args[1];
        int registryPort = args.length >= 3 ? Integer.parseInt(args[2]) : 1099;
        System.setProperty("java.rmi.server.hostname", host);
        Registry registry;
        try { registry = LocateRegistry.createRegistry(registryPort); }
        catch (Exception e) { registry = LocateRegistry.getRegistry("127.0.0.1", registryPort); }
        NodeAgent agent = new NodeAgent(id, host);
        registry.rebind("Node" + id, agent);
        System.out.println("Node " + id + " RMI service ready at " + host + ":" + registryPort + "/Node" + id);
        System.out.println("Fixed RMI object port: 5000; 4 worker threads per task.");
    }
}
