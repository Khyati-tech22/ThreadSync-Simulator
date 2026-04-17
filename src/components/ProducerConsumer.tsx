
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, ArrowRight } from 'lucide-react';

export const ProducerConsumer: React.FC = () => {
  const [buffer, setBuffer] = useState<number[]>([]);
  const [permits, setPermits] = useState(5); // Max buffer size
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const produce = () => {
    if (buffer.length < 5) {
      const item = Math.floor(Math.random() * 100);
      setBuffer(prev => [...prev, item]);
      addLog(`Produced item ${item}`);
    } else {
      addLog("Buffer FULL! Producer waiting...");
    }
  };

  const consume = () => {
    if (buffer.length > 0) {
      const item = buffer[0];
      setBuffer(prev => prev.slice(1));
      addLog(`Consumed item ${item}`);
    } else {
      addLog("Buffer EMPTY! Consumer waiting...");
    }
  };

  return (
    <div className="p-6 rounded-2xl border bg-white/50 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase opacity-70">Producer-Consumer (Semaphore)</h3>
        <Badge variant="outline" className="font-mono">Slots: {5 - buffer.length} / 5</Badge>
      </div>

      <div className="flex items-center justify-center gap-8 py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 border-2 border-blue-500/20">
            <Package className="w-8 h-8" />
          </div>
          <Button size="sm" onClick={produce} className="bg-blue-600 hover:bg-blue-700 text-white">Produce</Button>
        </div>

        <div className="flex-1 flex gap-2 p-4 rounded-xl border-2 border-dashed border-[#141414]/10 bg-white/30 min-h-[80px] items-center justify-center">
          <AnimatePresence>
            {buffer.map((item, i) => (
              <motion.div
                key={`${item}-${i}`}
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: 20 }}
                className="w-10 h-10 rounded-lg bg-[#141414] text-[#E4E3E0] flex items-center justify-center text-[10px] font-bold"
              >
                {item}
              </motion.div>
            ))}
            {buffer.length === 0 && <span className="text-[10px] font-mono opacity-30">BUFFER_EMPTY</span>}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600 border-2 border-orange-500/20">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <Button size="sm" onClick={consume} className="bg-orange-600 hover:bg-orange-700 text-white">Consume</Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase opacity-50">System Logs</div>
        <div className="bg-[#141414] text-[#E4E3E0] p-3 rounded-lg font-mono text-[10px] h-32 overflow-hidden">
          {logs.map((log, i) => (
            <div key={i} className={i === 0 ? "text-green-400" : "opacity-50"}>
              {`> ${log}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
