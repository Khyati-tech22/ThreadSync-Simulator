
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Utensils, User, Circle } from 'lucide-react';

type PhilosopherState = 'THINKING' | 'HUNGRY' | 'EATING';

interface Philosopher {
  id: number;
  state: PhilosopherState;
}

export const DiningPhilosophers: React.FC = () => {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>(
    Array.from({ length: 5 }, (_, i) => ({ id: i, state: 'THINKING' }))
  );
  const [forks, setForks] = useState<boolean[]>(Array(5).fill(true)); // true = available

  useEffect(() => {
    const interval = setInterval(() => {
      setPhilosophers(prev => {
        const next = [...prev];
        const nextForks = [...forks];
        
        // Randomly change state
        const idx = Math.floor(Math.random() * 5);
        const p = next[idx];

        if (p.state === 'THINKING') {
          p.state = 'HUNGRY';
        } else if (p.state === 'HUNGRY') {
          const leftFork = idx;
          const rightFork = (idx + 1) % 5;
          
          // Monitor logic: only eat if both forks are available
          if (nextForks[leftFork] && nextForks[rightFork]) {
            nextForks[leftFork] = false;
            nextForks[rightFork] = false;
            p.state = 'EATING';
            setForks(nextForks);
          }
        } else if (p.state === 'EATING') {
          const leftFork = idx;
          const rightFork = (idx + 1) % 5;
          nextForks[leftFork] = true;
          nextForks[rightFork] = true;
          p.state = 'THINKING';
          setForks(nextForks);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [forks]);

  return (
    <div className="p-6 rounded-2xl border bg-white/50 space-y-8 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase opacity-70">Dining Philosophers (Monitor)</h3>
        <Badge variant="outline" className="font-mono">5 Philosophers / 5 Forks</Badge>
      </div>

      <div className="relative w-64 h-64 mx-auto">
        {/* Table */}
        <div className="absolute inset-0 rounded-full border-4 border-[#141414]/10 bg-white/30 flex items-center justify-center">
          <div className="text-[10px] font-mono opacity-20 uppercase font-black">Shared Table</div>
        </div>

        {/* Philosophers */}
        {philosophers.map((p, i) => {
          const angle = (i * 360) / 5;
          const x = Math.cos((angle * Math.PI) / 180) * 100 + 128;
          const y = Math.sin((angle * Math.PI) / 180) * 100 + 128;

          return (
            <motion.div
              key={p.id}
              initial={false}
              animate={{
                x: x - 24,
                y: y - 24,
                scale: p.state === 'EATING' ? 1.2 : 1,
              }}
              className={`absolute w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center transition-colors ${
                p.state === 'EATING' ? 'bg-green-500 border-green-600 text-white' : 
                p.state === 'HUNGRY' ? 'bg-yellow-500 border-yellow-600 text-white' : 
                'bg-white border-[#141414]/20 text-[#141414]'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[8px] font-bold">{p.state[0]}</span>
            </motion.div>
          );
        })}

        {/* Forks */}
        {forks.map((available, i) => {
          const angle = (i * 360) / 5 + 36; // Position between philosophers
          const x = Math.cos((angle * Math.PI) / 180) * 60 + 128;
          const y = Math.sin((angle * Math.PI) / 180) * 60 + 128;

          return (
            <motion.div
              key={i}
              animate={{
                x: x - 8,
                y: y - 8,
                opacity: available ? 1 : 0.2,
                scale: available ? 1 : 0.8,
              }}
              className="absolute w-4 h-4 text-[#141414]"
            >
              <Utensils className="w-full h-full rotate-45" />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {['THINKING', 'HUNGRY', 'EATING'].map(s => (
          <div key={s} className="flex items-center gap-2 text-[10px] font-bold opacity-70">
            <div className={`w-2 h-2 rounded-full ${
              s === 'EATING' ? 'bg-green-500' : s === 'HUNGRY' ? 'bg-yellow-500' : 'bg-white border border-[#141414]/20'
            }`} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};
