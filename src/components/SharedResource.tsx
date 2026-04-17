
import React, { useState, useEffect } from 'react';
import { Thread } from '../types';
import { motion } from 'motion/react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface SharedResourceProps {
  runningThreads: Thread[];
  isLocked: boolean;
}

export const SharedResource: React.FC<SharedResourceProps> = ({ runningThreads, isLocked }) => {
  const [isGlitched, setIsGlitched] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (runningThreads.length > 1 && !isLocked) {
      setIsGlitched(true);
    } else {
      setIsGlitched(false);
    }

    if (runningThreads.length > 0) {
      // Simulate race condition: multiple threads incrementing same value without lock
      const increment = runningThreads.length > 1 && !isLocked ? Math.random() * 10 : 1;
      setValue(prev => (prev + increment) % 100);
    }
  }, [runningThreads, isLocked]);

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border bg-card shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold font-mono tracking-tight uppercase opacity-70">Shared Buffer</h3>
        {isLocked ? (
          <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
            <ShieldCheck className="w-4 h-4" />
            PROTECTED
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
            <ShieldAlert className="w-4 h-4" />
            UNPROTECTED
          </div>
        )}
      </div>

      <div className={`h-24 w-full rounded-xl border-2 flex items-center justify-center transition-all duration-100 ${
        isGlitched ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-primary/5 border-primary/20'
      }`}>
        <div className="text-4xl font-mono font-black tracking-tighter">
          {isGlitched ? (
            <motion.span
              animate={{ x: [-2, 2, -2], skew: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              className="text-red-600"
            >
              ERR_RACE
            </motion.span>
          ) : (
            <span>{Math.floor(value)}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        {runningThreads.map(t => (
          <motion.div
            key={t.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>

      {isGlitched && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none flex items-center justify-center">
          <div className="text-[8px] font-bold text-red-500 rotate-12 border border-red-500 px-1">CRITICAL_SECTION_VIOLATION</div>
        </div>
      )}
    </div>
  );
};
