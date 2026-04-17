import { useState } from 'react';
import { useSimulationEngine } from './hooks/useSimulationEngine';
import { ThreadCard } from './components/ThreadCard';
import { CPUDisplay } from './components/CPUDisplay';
import { SharedResource } from './components/SharedResource';
import { ProducerConsumer } from './components/ProducerConsumer';
import { DiningPhilosophers } from './components/DiningPhilosophers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  Activity, 
  Users, 
  Cpu, 
  Lock, 
  Unlock,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const {
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
    monitor,
    setMonitor
  } = useSimulationEngine();

  const [isLocked, setIsLocked] = useState(false);

  const handleAddThread = () => {
    const names = ['Worker', 'Renderer', 'Network', 'IO-Task', 'UI-Update', 'Parser', 'Logger'];
    const randomName = `${names[Math.floor(Math.random() * names.length)]}-${threads.length + 1}`;
    addThread(randomName, 50 + Math.random() * 100);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
        {/* Header */}
        <header className="border-b border-[#141414] p-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-[#141414] text-[#E4E3E0] p-2 rounded-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">ThreadSync v1.0</h1>
              <p className="text-[10px] font-mono opacity-50 italic">OS Architecture Simulator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#141414]/10 bg-white/30">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-xs font-mono font-bold">CPU: {stats.cpuUtilization}%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#141414]/10 bg-white/30">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono font-bold">Threads: {threads.length}</span>
            </div>
          </div>
        </header>

        <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
          {/* Sidebar Controls */}
          <aside className="lg:col-span-3 space-y-6">
            <Card className="border-[#141414] shadow-none bg-transparent">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-mono italic opacity-50 uppercase flex items-center gap-2">
                  <Settings2 className="w-3 h-3" />
                  Simulation Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className="flex-1 bg-[#141414] hover:bg-[#141414]/90 text-[#E4E3E0]"
                  >
                    {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button variant="outline" onClick={resetSimulation} className="border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase opacity-70">
                      <Label>Simulation Speed</Label>
                      <span>{simulationSpeed}x</span>
                    </div>
                    <Slider 
                      value={[simulationSpeed]} 
                      onValueChange={(v) => setSimulationSpeed(v[0])} 
                      max={5} 
                      step={0.5} 
                      min={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase opacity-70">
                      <Label>CPU Quantum</Label>
                      <span>{quantum} cycles</span>
                    </div>
                    <Slider 
                      value={[quantum]} 
                      onValueChange={(v) => setQuantum(v[0])} 
                      max={50} 
                      step={5} 
                      min={5}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#141414]/10 space-y-4">
                  <Label className="text-[10px] font-bold uppercase opacity-70">Threading Model</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'MANY_TO_ONE', label: 'Many-to-One', desc: 'N User -> 1 Kernel' },
                      { id: 'ONE_TO_ONE', label: 'One-to-One', desc: '1 User -> 1 Kernel' },
                      { id: 'MANY_TO_MANY', label: 'Many-to-Many', desc: 'M User -> N Kernel' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModel(m.id as any)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          model === m.id 
                            ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' 
                            : 'bg-white/50 border-[#141414]/10 hover:border-[#141414]/30'
                        }`}
                      >
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[9px] opacity-60 font-mono">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddThread} className="w-full border-2 border-dashed border-[#141414]/30 bg-transparent text-[#141414] hover:bg-[#141414]/5">
                  <Plus className="w-4 h-4 mr-2" />
                  Spawn New Thread
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#141414] shadow-none bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono italic opacity-50 uppercase">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/50 border border-[#141414]/10">
                    <div className="text-[9px] uppercase font-bold opacity-50">Avg Wait</div>
                    <div className="text-xl font-black font-mono">{stats.avgWaitTime}s</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/50 border border-[#141414]/10">
                    <div className="text-[9px] uppercase font-bold opacity-50">Completed</div>
                    <div className="text-xl font-black font-mono">{stats.completedThreads}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            <Tabs defaultValue="scheduling" className="w-full">
              <TabsList className="bg-white/50 border border-[#141414]/10 p-1">
                <TabsTrigger value="scheduling" className="data-[state=active]:bg-[#141414] data-[state=active]:text-[#E4E3E0]">
                  <Layers className="w-4 h-4 mr-2" />
                  Process Scheduling
                </TabsTrigger>
                <TabsTrigger value="sync" className="data-[state=active]:bg-[#141414] data-[state=active]:text-[#E4E3E0]">
                  <Lock className="w-4 h-4 mr-2" />
                  Synchronization
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scheduling" className="space-y-6 mt-6">
                {/* CPU Visualizer */}
                <section className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Kernel Processing Unit</h2>
                    <Badge variant="outline" className="font-mono text-[10px]">{kernelThreads.length} KLTs Active</Badge>
                  </div>
                  <CPUDisplay kernelThreads={kernelThreads} threads={threads} />
                </section>

                {/* Thread Queue */}
                <section className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">User Thread Pool</h2>
                  <div className="flex flex-wrap gap-4 p-6 rounded-2xl border-2 border-dashed border-[#141414]/10 bg-white/20 min-h-[200px]">
                    <AnimatePresence>
                      {threads.map((thread) => (
                        <ThreadCard key={thread.id} thread={thread} />
                      ))}
                      {threads.length === 0 && (
                        <div className="w-full flex flex-col items-center justify-center text-muted-foreground opacity-30 py-12">
                          <Users className="w-12 h-12 mb-2" />
                          <p className="text-xs font-mono">Ready Queue Empty</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="sync" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Race Condition Demo</h2>
                    <p className="text-xs text-muted-foreground">
                      Observe how multiple threads accessing the same resource without a lock causes data corruption.
                    </p>
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch 
                        id="lock-mode" 
                        checked={isLocked} 
                        onCheckedChange={setIsLocked}
                      />
                      <Label htmlFor="lock-mode" className="text-xs font-bold flex items-center gap-2">
                        {isLocked ? <Lock className="w-3 h-3 text-green-600" /> : <Unlock className="w-3 h-3 text-red-600" />}
                        Enable Mutex Lock
                      </Label>
                    </div>
                    <SharedResource 
                      runningThreads={threads.filter(t => t.state === 'RUNNING')} 
                      isLocked={isLocked} 
                    />
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Producer-Consumer Simulation</h2>
                    <ProducerConsumer />
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Dining Philosophers (Monitor)</h2>
                    <DiningPhilosophers />
                  </section>

                  <section className="space-y-4 md:col-span-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest opacity-70">Sync Theory</h2>
                    <Card className="border-[#141414]/10 shadow-none bg-white/50">
                      <CardHeader>
                        <CardTitle className="text-sm">Semaphore vs Monitor</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-4 font-mono leading-relaxed">
                        <div className="p-3 rounded bg-[#141414]/5 border-l-4 border-[#141414]">
                          <span className="font-bold">Semaphore:</span> Low-level integer-based signal. Used for signaling between threads or managing a pool of resources.
                        </div>
                        <div className="p-3 rounded bg-[#141414]/5 border-l-4 border-[#141414]">
                          <span className="font-bold">Monitor:</span> High-level synchronization construct. Encapsulates data and procedures, ensuring only one thread executes at a time.
                        </div>
                        <p className="opacity-70 italic">
                          * In this simulator, the "Mutex Lock" toggle represents a binary semaphore (mutex) protecting the shared buffer.
                        </p>
                      </CardContent>
                    </Card>
                  </section>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#141414]/10 p-8 text-center">
          <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
            Designed for Educational Purposes • OS Concepts Visualizer
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
