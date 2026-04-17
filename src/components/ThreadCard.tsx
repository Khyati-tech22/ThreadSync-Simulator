
import React from 'react';
import { Thread } from '../types';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cpu, Clock, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface ThreadCardProps {
  thread: Thread;
}

const stateColors = {
  NEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  READY: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  RUNNING: 'bg-green-500/10 text-green-500 border-green-500/20',
  WAITING: 'bg-red-500/10 text-red-500 border-red-500/20',
  TERMINATED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const stateIcons = {
  NEW: <PlayCircle className="w-3 h-3" />,
  READY: <Clock className="w-3 h-3" />,
  RUNNING: <Cpu className="w-3 h-3" />,
  WAITING: <AlertCircle className="w-3 h-3" />,
  TERMINATED: <CheckCircle2 className="w-3 h-3" />,
};

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col gap-2 min-w-[180px]"
    >
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs font-bold truncate max-w-[100px]">{thread.name}</span>
        <Badge variant="outline" className={`${stateColors[thread.state]} flex gap-1 items-center px-1.5 py-0 text-[10px]`}>
          {stateIcons[thread.state]}
          {thread.state}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(thread.progress)}%</span>
        </div>
        <Progress value={thread.progress} className="h-1" />
      </div>

      <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/50">
        <div className="flex items-center gap-1">
          {thread.state === 'WAITING' ? (
            <span className="text-red-500 font-bold animate-pulse">{thread.blockedReason}</span>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>Wait: {thread.waitTime}s</span>
            </>
          )}
        </div>
        {thread.kernelThreadId && thread.state !== 'WAITING' && (
          <div className="flex items-center gap-1 text-primary">
            <Cpu className="w-3 h-3" />
            <span>{thread.kernelThreadId}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
