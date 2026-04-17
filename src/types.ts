
export type ThreadState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export type ThreadingModel = 'MANY_TO_ONE' | 'ONE_TO_ONE' | 'MANY_TO_MANY';

export interface Thread {
  id: string;
  name: string;
  state: ThreadState;
  progress: number; // 0 to 100
  totalWork: number;
  waitTime: number;
  burstTime: number; // Time spent in current RUNNING state
  kernelThreadId?: string;
  blockedReason?: string;
  blockedRemaining?: number;
}

export interface KernelThread {
  id: string;
  runningThreadId?: string;
  load: number;
}

export interface SimulationStats {
  cpuUtilization: number;
  avgWaitTime: number;
  completedThreads: number;
}

export interface Semaphore {
  permits: number;
  maxPermits: number;
  queue: string[]; // Thread IDs waiting
}

export interface Monitor {
  isLocked: boolean;
  ownerId?: string;
  queue: string[];
}
