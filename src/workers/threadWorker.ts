/**
 * Background Thread Worker
 * 
 * This worker simulates a CPU-bound process. It uses Atomics on SharedArrayBuffers
 * to allow the main thread and this worker to communicate states (READY, RUNNING, WAITING)
 * and progress without the latency of postMessage.
 * 
 * Communication Protocol:
 * - sharedBuffer[0]: Progress (0-1000)
 * - sharedBuffer[1]: Current state (mapped to STATE_MAP)
 * - mutexBuffer: Global lock for resource synchronization
 */

/* eslint-disable no-restricted-globals */

self.onmessage = (e) => {
  const { 
    id, 
    sharedBuffer, 
    mutexBuffer, 
    configBuffer 
  } = e.data;

  // sharedBuffer[0]: Progress (0-1000)
  // sharedBuffer[1]: State (0: NEW, 1: READY, 2: RUNNING, 3: WAITING, 4: TERMINATED)
  // mutexBuffer[0]: Lock State (0: Unlocked, 1: Locked)
  // configBuffer[0]: Lock Enabled (0: No, 1: Yes)
  // configBuffer[1]: Simulation Speed Scale

  const progressArray = new Int32Array(sharedBuffer);
  const mutexArray = new Int32Array(mutexBuffer);
  const configArray = new Int32Array(configBuffer);

  let localProgress = 0;

  function doWork() {
    if (progressArray[1] === 2) { // RUNNING
      
      // If Mutex is enabled, try to acquire it
      if (configArray[0] === 1) {
        // Atomic compare and swap: Only if 0, set to 1.
        // If it's already 1, this blocks if we had a proper mutex, 
        // but since we want to show 'WAITING', we check it.
        if (Atomics.compareExchange(mutexArray, 0, 0, 1) === 1) {
           // Lock is held by someone else
           progressArray[1] = 3; // Shift to WAITING
           return;
        }
        // Acquire lock
        Atomics.store(mutexArray, 0, 1);
      }

      // Simulate Real Work
      const workAmount = 1 * (configArray[1] || 1);
      localProgress += workAmount;
      progressArray[0] = Math.min(1000, localProgress);

      if (localProgress >= 1000) {
        progressArray[1] = 4; // TERMINATED
        if (configArray[0] === 1) Atomics.store(mutexArray, 0, 0); // Release lock
        return;
      }

      // Release Lock if we held it
      if (configArray[0] === 1) {
        Atomics.store(mutexArray, 0, 0);
        Atomics.notify(mutexArray, 0, 1);
      }
    }

    // High precision re-scheduling
    setTimeout(doWork, 10);
  }

  doWork();
};
