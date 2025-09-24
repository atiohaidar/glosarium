import React, { useEffect, useState } from 'react';
import { ClockIcon } from '../ui/icons';
import { formatDuration } from '../../utils/quizUtils';

interface QuizTimerProps {
  startTime: number;
  isActive: boolean;
  onTimeUpdate?: (elapsedMs: number) => void;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ startTime, isActive, onTimeUpdate }) => {
    const [elapsedMs, setElapsedMs] = useState<number>(0);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - startTime;
            setElapsedMs(elapsed);
            onTimeUpdate?.(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isActive, onTimeUpdate]);

    return (
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <ClockIcon className="w-5 h-5" />
            <span className="font-mono text-lg">{formatDuration(elapsedMs)}</span>
        </div>
    );
};