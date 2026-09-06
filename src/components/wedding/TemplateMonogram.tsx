'use client';

import { MonogramMark } from '@/components/MonogramMark';
import { getSafeMonogramConfig, type MonogramShape } from '@/lib/monogram';
import type { Wedding } from '@/types/wedding';

interface TemplateMonogramProps {
    wedding: Wedding;
    defaultShape?: MonogramShape;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    inverted?: boolean;
    color?: string;
    motifColor?: string;
}

export default function TemplateMonogram({
    wedding,
    defaultShape = 'circle',
    size = 'sm',
    className = '',
    inverted = false,
    color,
    motifColor: customMotifColor,
}: TemplateMonogramProps) {
    if (!wedding.logo_initials) return null;

    const { shape, animation } = getSafeMonogramConfig(
        {
            shape: wedding.logo_shape || defaultShape,
            animation: wedding.logo_animation,
        },
        Boolean(wedding.is_premium)
    );

    const motifColor = customMotifColor || wedding.motif_color || '#D16C78';
    const markColor = color || wedding.logo_color || motifColor;

    return (
        <div className={`template-monogram-wrapper flex items-center justify-center ${className}`}>
            <MonogramMark
                initials={wedding.logo_initials}
                brideName={wedding.bride_name}
                groomName={wedding.groom_name}
                shape={shape}
                animation={animation}
                color={markColor}
                motifColor={motifColor}
                fontFamily={`var(--font-${wedding.logo_font?.toLowerCase() || 'serif'})`}
                size={size}
                inverted={inverted}
            />
        </div>
    );
}
