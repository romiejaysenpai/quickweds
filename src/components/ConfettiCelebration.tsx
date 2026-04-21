'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

export default function ConfettiCelebration({ trigger, onComplete }: ConfettiProps) {
    const fireConfetti = useCallback(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                onComplete?.();
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // Multiple origin points for fuller effect
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

        // Initial burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D16C78', '#F2C1CC', '#D6B87C', '#7A5A61', '#FFF8F4'],
        });

        return () => clearInterval(interval);
    }, [onComplete]);

    useEffect(() => {
        if (trigger) {
            fireConfetti();
        }
    }, [trigger, fireConfetti]);

    return null;
}

// Hook for triggering confetti
export function useConfetti() {
    const trigger = useCallback(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
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

        return () => clearInterval(interval);
    }, []);

    return trigger;
}
