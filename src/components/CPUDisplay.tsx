
import React from 'react';
import { KernelThread, Thread } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap } from 'lucide-react';

interface CPUDisplayProps {
  kernelThreads: KernelThread[];
  threads: Thread[];
}

export const CPUDisplay: React.FC<CPUDisplayProps> = ({ kernelThreads, threads }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {kernelThreads.map((kt) => {
        const runningThread = threads.find(t => t.id === kt.runningThreadId);
        
        return (
          <div key={kt.id} className="relative p-4 rounded-xl border bg-black/5 dark:bg-white/5 border-dashed border-primary/30 flex flex-col items-center justify-center min-h-[120px] overflow-hidden">
            <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono text-primary/50">
              <Cpu className="w-3 h-3" />
              {kt.id.toUpperCase()}
            </div>

            <AnimatePresence mode="wait">
              {runningThread ? (
                <motion.div
                  key={runningThread.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <span className="font-mono text-sm font-bold">{runningThread.name}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-1 h-3 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-muted-foreground text-xs font-mono italic">IDLE</div>
              )}
            </AnimatePresence>

            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-5">
              <Cpu className="w-24 h-24" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
