'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HoldToDeleteButtonProps {
  onDelete: () => void;
  className?: string;
}

const HOLD_TIME = 1000; // 1 second

export function HoldToDeleteButton({ onDelete, className }: HoldToDeleteButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHolding(true);
    timerRef.current = setTimeout(() => {
      onDelete();
      setIsHolding(false);
    }, HOLD_TIME);
  };

  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div
      className={cn(
        "absolute top-1 right-1 z-20 h-7 w-7 rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75 hover:text-white flex items-center justify-center cursor-pointer",
        className
      )}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      role="button"
      aria-label="Hold to remove from list"
    >
      <AnimatePresence>
        {isHolding && (
          <motion.svg
            className="absolute inset-0"
            width="28"
            height="28"
            viewBox="0 0 28 28"
          >
            <motion.circle
              cx="14"
              cy="14"
              r="12"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="transparent"
              transform="rotate(-90 14 14)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: HOLD_TIME / 1000, ease: 'linear' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
      <Trash2 className="h-4 w-4" />
    </div>
  );
}
