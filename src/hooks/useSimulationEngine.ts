
import { useState, useEffect, useCallback, useRef } from 'react';
import { Thread, KernelThread, ThreadingModel, ThreadState, SimulationStats, Semaphore, Monitor } from '../types';

// Helper to convert numeric state back to string
const STATE_MAP: ThreadState[] = ['NEW', 'READY', 'RUNNING', 'WAITING', 'TERMINATED'];

export const useSimulationEngine = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [kernelThreads, setKernelThreads] = useState<KernelThread[]>([]);
  const [model, setModel] = useState<ThreadingModel>('MANY_TO_ONE');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [quantum, setQuantum] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<SimulationStats>({
    cpuUtilization: 0,
    avgWaitTime: 0,
    completedThreads: 0,
  });

  // Shared state for the Mutex Lock
  const mutexBuffer = useRef(new SharedArrayBuffer(4));
  const configBuffer = useRef(new SharedArrayBuffer(8)); // [0]: Lock Enabled, [1]: Speed

  // References to workers to avoid React re-renders killing them
  const workers = useRef<{ [key: string]: { worker: Worker, buffer: SharedArrayBuffer } }>({});

  const [semaphore, setSemaphore] = useState<Semaphore>({ permits: 2, maxPermits: 2, queue: [] });
  const [monitor, setMonitor] = useState<Monitor>({ isLocked: false, queue: [] });

  const frameRef = useRef<number>(0);

  // Initialize Kernel Threads
  useEffect(() => {
    let ktCount = 1;
    if (model === 'ONE_TO_ONE') {
      const activeCount = threads.filter(t => t.state !== 'TERMINATED').length;
      ktCount = Math.max(1, activeCount);
    }
    if (model === 'MANY_TO_MANY') ktCount = 3;

    setKernelThreads(prev => {
      const newKTs: KernelThread[] = Array.from({ length: ktCount }, (_, i) => {
        const existing = prev[i];
        return existing || { id: `kt-${i}`, load: 0 };
      });
      return newKTs;
    });
  }, [model, threads.filter(t => t.state !== 'TERMINATED').length]);

  // Sync config to workers
  useEffect(() => {
    const config = new Int32Array(configBuffer.current);
    config[0] = monitor.isLocked ? 1 : 0;
    config[1] = simulationSpeed;
  }, [monitor.isLocked, simulationSpeed]);

  const addThread = useCallback((name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Create REAL background worker
    const worker = new Worker(new URL('../workers/threadWorker.ts', import.meta.url), { type: 'module' });
    const buffer = new SharedArrayBuffer(8); // [0]: Progress (0-1000), [1]: State
    
    const stateArray = new Int32Array(buffer);
    stateArray[1] = 1; // Start in READY state

    worker.postMessage({
      id,
      sharedBuffer: buffer,
      mutexBuffer: mutexBuffer.current,
      configBuffer: configBuffer.current
    });

    workers.current[id] = { worker, buffer };

    const newThread: Thread = {
      id,
      name,
      state: 'READY',
      progress: 0,
      totalWork: 100,
      waitTime: 0,
      burstTime: 0,
    };

    setThreads(prev => [...prev, newThread]);
  }, []);

  const resetSimulation = useCallback(() => {
    Object.values(workers.current).forEach(w => w.worker.terminate());
    workers.current = {};
    setThreads([]);
    setStats({ cpuUtilization: 0, avgWaitTime: 0, completedThreads: 0 });
  }, []);

  // REAL TIME TICK: Sync background worker states to React UI
  const syncTick = useCallback(() => {
    if (!isRunning) return;

    setThreads(prevThreads => {
      const nextThreads = [...prevThreads];
      const nextKTs = [...kernelThreads];

      // Update Thread states from Shared Memory
      nextThreads.forEach(t => {
        const workerData = workers.current[t.id];
        if (workerData) {
          const stateArray = new Int32Array(workerData.buffer);
          t.progress = stateArray[0] / 10;
          
          // Only sync state IF not managed by Scheduler
          const externalState = STATE_MAP[stateArray[1]];
          if (externalState === 'TERMINATED') {
             t.state = 'TERMINATED';
             const kt = nextKTs.find(k => k.runningThreadId === t.id);
             if (kt) kt.runningThreadId = undefined;
          }
          if (externalState === 'WAITING' && t.state === 'RUNNING') {
             t.state = 'WAITING';
             const kt = nextKTs.find(k => k.runningThreadId === t.id);
             if (kt) kt.runningThreadId = undefined;
          }
        }
      });

      // Scheduler Logic (Preemption)
      const runningThreads = nextThreads.filter(t => t.state === 'RUNNING');
      runningThreads.forEach(t => {
        t.burstTime += 1;
        if (t.burstTime >= quantum) {
          t.state = 'READY';
          t.burstTime = 0;
          const kt = nextKTs.find(k => k.runningThreadId === t.id);
          if (kt) kt.runningThreadId = undefined;
          
          // Force worker state
          const workerData = workers.current[t.id];
          if (workerData) new Int32Array(workerData.buffer)[1] = 1; 
        }
      });

      // Assign Ready threads to KTs
      const availableKTs = nextKTs.filter(kt => !kt.runningThreadId);
      const readyThreads = nextThreads.filter(t => t.state === 'READY');

      readyThreads.forEach(t => {
        if (availableKTs.length > 0) {
          const kt = availableKTs.shift()!;
          t.state = 'RUNNING';
          kt.runningThreadId = t.id;
          
          // Inform worker via shared memory
          const workerData = workers.current[t.id];
          if (workerData) new Int32Array(workerData.buffer)[1] = 2; // Set to RUNNING
        } else {
          t.waitTime += 0.1;
        }
      });

      setKernelThreads(nextKTs);
      return nextThreads;
    });

    frameRef.current = requestAnimationFrame(syncTick);
  }, [isRunning, kernelThreads, quantum]);

  useEffect(() => {
    if (isRunning) {
      frameRef.current = requestAnimationFrame(syncTick);
    } else {
      cancelAnimationFrame(frameRef.current);
      // Pause all workers
      Object.keys(workers.current).forEach(id => {
         const stateArray = new Int32Array(workers.current[id].buffer);
         if (stateArray[1] === 2) stateArray[1] = 1; // Shift RUNNING -> READY
      });
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [isRunning, syncTick]);

  return {
    threads,
    kernelThreads,
    model,
    setModel,
    simulationSpeed,
    setSimulationSpeed,
    quantum,
    setQuantum,
    isRunning,
    setIsRunning,
    addThread,
    resetSimulation,
    stats,
    semaphore,
    setSemaphore,
    monitor,
    setMonitor
  };
};
