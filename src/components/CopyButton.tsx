'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCheck, Link2 } from 'lucide-react';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
    variant?: 'default' | 'minimal' | 'icon-only';
    onCopy?: () => void;
}

export default function CopyButton({ 
    text, 
    label = 'Copy', 
    className = '',
    variant = 'default',
    onCopy 
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            
            setCopied(true);
            onCopy?.();
            
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [text, onCopy]);

    if (variant === 'icon-only') {
        return (
            <button
                onClick={handleCopy}
                title={label}
                className={`relative flex items-center justify-center transition-all ${className}`}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                        <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-green-500"
                        >
                            <CheckCheck className="w-4 h-4" />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Copy className="w-4 h-4" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        );
    }

    if (variant === 'minimal') {
        return (
            <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    copied 
                        ? 'text-green-600' 
                        : 'text-text-secondary hover:text-primary'
                } ${className}`}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                        <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Copied!
                        </motion.span>
                    ) : (
                        <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        );
    }

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                copied 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-neutral text-text-secondary hover:text-primary hover:bg-neutral/80 border border-border'
            } ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                    <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Copied!
                    </motion.span>
                ) : (
                    <motion.span
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Link2 className="w-4 h-4" />
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
