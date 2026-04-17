# ThreadSync Simulator 🧵

An advanced, interactive educational visualizer for Operating System threading models and synchronization primitives. Built with modern web technologies to provide a high-fidelity simulation of kernel-level processing.

## ✨ Core Features

### 1. Threading Models
- **Many-to-One**: Map multiple user threads to a single kernel thread. Observe systemic blocking.
- **One-to-One**: Experience true parallelism where every user thread gets its own kernel resource.
- **Many-to-Many**: The gold standard — dynamic multiplexing of user threads over a pool of kernel threads.

### 2. Synchronization Primitives
- **Mutex Locks**: Toggle race conditions and see how shared buffers get corrupted without atomic locks.
- **Semaphores**: Visualizing counting semaphores for resource management.
- **Monitors**: High-level constructs demonstrated through the classic Dining Philosophers problem.

### 3. Real-time Visualization
- **CPU Heatmap**: Visual feedback of kernel load and thread execution states.
- **Interactive Controls**: Adjust simulation speed, CPU quantum, and thread spawning in real-time.

---

## 🚀 Technical Stack

- **Framework**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Logic**: Web Workers for true background execution
- **UI Components**: shadcn/ui

---

## 🛠️ Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Set your `GEMINI_API_KEY` in `.env.local` for AI-assisted insights.

3. **Launch Simulation:**
   ```bash
   npm run dev
   ```

---

## 📖 Architecture Overview

The simulator uses a **SharedArrayBuffer** and **Atomics** architecture. This allows the main UI thread to communicate with background Web Workers at high speed without the overhead of postMessage, simulating real OS context switching behaviors.

---

Designed for educational purposes by **Khyati-tech22**.
