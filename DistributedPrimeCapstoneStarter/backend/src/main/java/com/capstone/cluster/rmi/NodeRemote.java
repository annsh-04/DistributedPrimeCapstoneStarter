package com.capstone.cluster.rmi;

import java.rmi.Remote;
import java.rmi.RemoteException;
import java.util.List;

public interface NodeRemote extends Remote
{
    NodeSnapshot getStatus() throws RemoteException;
    int countPrimes(int start, int end, int taskId) throws RemoteException;
    boolean ping() throws RemoteException;
    void setCoordinator(int coordinatorId) throws RemoteException;
    int getNodeId() throws RemoteException;
    void replicateTask(TaskReplica task) throws RemoteException;
    List<TaskReplica> getReplicatedTasks() throws RemoteException;
}
