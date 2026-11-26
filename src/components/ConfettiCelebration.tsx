'use client';

import { useEffect, useCallback } from 'react';

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

function startConfettiSequence(onComplete?: () => void) {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    void import('canvas-confetti')
        .then(({ default: confetti }) => {
            if (cancelled) return;

            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    if (interval) clearInterval(interval);
                    interval = null;
                    onComplete?.();
                    return;
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#D16C78', '#F2C1CC', '#D6B87C', '#7A5A61', '#FFF8F4'],
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#D16C78', '#F2C1CC', '#D6B87C', '#7A5A61', '#FFF8F4'],
                });
            }, 250);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#D16C78', '#F2C1CC', '#D6B87C', '#7A5A61', '#FFF8F4'],
            });
        })
        .catch(() => undefined);

    return () => {
        cancelled = true;
        if (interval) clearInterval(interval);
    };
}

export default function ConfettiCelebration({ trigger, onComplete }: ConfettiProps) {
    useEffect(() => {
        if (!trigger) return;
        return startConfettiSequence(onComplete);
    }, [trigger, onComplete]);

    return null;
}

// Hook for triggering confetti
export function useConfetti() {
    const trigger = useCallback(() => startConfettiSequence(), []);

    return trigger;
}
