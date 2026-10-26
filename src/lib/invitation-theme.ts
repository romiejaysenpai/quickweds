import type { CSSProperties } from 'react';
import type { Wedding } from '@/types/wedding';
import { getReferenceInvitation } from './reference-invitations';
import { getTemplateVisualProfile } from './theme-engine';

function hex(value: string | undefined, fallback: string) {
    const trimmed = value?.trim();
    if (/^#[0-9a-f]{6}$/i.test(trimmed || '')) return trimmed!;
    if (/^#[0-9a-f]{3}$/i.test(trimmed || '')) return `#${trimmed!.slice(1).split('').map(c => c + c).join('')}`;
    return fallback;
}
function mix(a: string, b: string, amount: number) {
    return `#${[1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - amount) + parseInt(b.slice(i, i + 2), 16) * amount).toString(16).padStart(2, '0')).join('')}`;
}
export function colorLuminance(color: string) {
    const channels = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a: string, b: string) {
    const x = colorLuminance(a), y = colorLuminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
function readableAccent(accent: string, surface: string, ink: string) {
    for (let amount = 0; amount <= 1; amount += .1) {
        const candidate = mix(accent, ink, amount);
        if (contrast(candidate, surface) >= 4.5) return candidate;
    }
    return ink;
}
const COLLECTION_GEOMETRY: Record<string, { card: string; button: string }> = {
    'winter-castle': { card: '2px', button: '2px' },
    'olive-lights': { card: '0px', button: '2px' },
    'split-monogram': { card: '2px', button: '999px' },
    'calla-envelope': { card: '12px', button: '999px' },
    'hydrangea-coast': { card: '0px', button: '2px' },
    'blush-botanical': { card: '3px', button: '2px' },
    'sage-wreath': { card: '12px', button: '999px' },
    'monochrome-collage': { card: '20px 0px 20px 0px', button: '0px' },
    'blue-scallop': { card: '28px', button: '999px' },
    'cocoa-capsule': { card: '60px', button: '3px' },
    'winter-blue': { card: '2px', button: '2px' },
    'rose-monogram': { card: '2px', button: '999px' },
    'pearl-ballroom': { card: '34px', button: '999px' },
    'sea-glass': { card: '14px', button: '999px' },
    'ocean-coral': { card: '26px', button: '999px' },
    'coastal-silver': { card: '10px', button: '2px' },
    'gold-leaf-frame': { card: '22px', button: '999px' },
    'navy-celebration': { card: '0px', button: '999px' },
    'blue-chinoiserie': { card: '0px', button: '2px' },
    'olive-wave': { card: '14px', button: '3px' },
};

const BACKGROUNDS: Record<string, string> = { white: '#ffffff', cream: '#fff8f4', satin: '#fdf5e6', paper: '#f4f1ea', minimal: '#f9f9f9', rose: '#fff5f5', linen: '#faf9f6' };

/** Resolve presentation once for the whole public page, including shared UI outside the renderer. */
export function getInvitationTheme(wedding: Wedding) {
    const reference = getReferenceInvitation(wedding.template_style);
    if (!reference || reference.templateId !== wedding.template) return undefined;
    return { ...resolvePresentation(wedding, reference), reference };
}

function resolvePresentation(wedding: Wedding, reference: { layout: string; accent: string; paper: string; ink: string }) {
    const motif = hex(wedding.motif_color, reference.accent);
    const paper = BACKGROUNDS[wedding.background_style || ''] || reference.paper;
    const ink = contrast(reference.ink, paper) >= 7 ? reference.ink : colorLuminance(paper) < .18 ? '#fff8f0' : '#262822';
    const onAction = contrast('#ffffff', motif) >= contrast('#000000', motif) ? '#ffffff' : '#000000';
    const subtle = mix(paper, motif, .07);
    const border = mix(paper, motif, .32);
    const link = readableAccent(motif, paper, ink);
    const muted = mix(ink, paper, .22);
    const sharp = ['ticket', 'toile', 'gold', 'forest', 'classic', 'western'].includes(reference.layout);
    const geometry = COLLECTION_GEOMETRY[reference.layout];
    const defaultRadius = geometry?.card || (sharp ? '3px' : reference.layout === 'doodle' ? '18px 6px 16px 8px' : '14px');
    const radius = wedding.card_style === 'arch_panel' ? '40px 40px 8px 8px' : wedding.card_style === 'editorial_rules' || wedding.card_style === 'full_bleed_strip' ? '0px' : wedding.card_style === 'cards_bordered' ? '8px' : defaultRadius;
    const buttonRadius = geometry?.button || (sharp ? '3px' : reference.layout === 'doodle' ? '5px' : '999px');
    const titleFont = wedding.section_title_font_style === 'romantic-script' ? 'var(--font-script)' : wedding.section_title_font_style === 'modern-sans' ? 'var(--font-montserrat)' : wedding.section_title_font_style === 'editorial-serif' ? 'var(--font-bodoni)' : 'var(--font-serif)';
    const vars = {
        '--invitation-motif': motif, '--invitation-paper': paper, '--invitation-ink': ink,
        '--invitation-subtle': subtle, '--invitation-muted': muted, '--invitation-border': border,
        '--invitation-dark-accent': readableAccent(motif, mix('#181614', motif, .38), '#ffffff'), '--invitation-link': link, '--invitation-action': motif, '--invitation-on-action': onAction,
        '--invitation-heading-font': 'var(--font-serif)', '--invitation-title-font': titleFont,
        '--invitation-body-font': 'var(--font-sans)', '--invitation-card-radius': radius,
        '--invitation-button-radius': buttonRadius,
        '--invitation-card-surface': wedding.card_style === 'borderless_glass' ? `color-mix(in srgb, ${paper} 80%, transparent)` : wedding.card_style === 'editorial_rules' ? paper : subtle,
        '--invitation-card-border-width': wedding.card_style === 'borderless_glass' || wedding.card_style === 'full_bleed_strip' ? '0px' : wedding.card_style === 'editorial_rules' ? '1px 0px' : '1px',
        '--invitation-card-filter': wedding.card_style === 'borderless_glass' ? 'blur(16px)' : 'none',
        '--invitation-card-shadow': wedding.card_style === 'soft_parchment' ? `0 12px 35px ${mix(paper, ink, .15)}66` : 'none',
        '--invitation-card-border': wedding.card_style === 'borderless_glass' || wedding.card_style === 'full_bleed_strip' ? 'transparent' : border,
        '--ref-paper': paper, '--ref-ink': ink, '--ref-accent': motif, '--ref-on-accent': onAction,
        '--primary': motif, '--color-primary': motif, '--accent': link, '--color-accent': link,
        '--secondary': subtle, '--color-secondary': subtle, '--background': paper, '--color-background': paper,
        '--neutral': paper, '--color-neutral': paper, '--foreground': ink, '--color-foreground': ink,
        '--border': border, '--color-border': border, '--text-secondary': muted, '--color-text-secondary': muted,
        '--wedding-heading': ink, '--wedding-ink': ink,
        color: ink, backgroundColor: paper, backgroundImage: 'none', colorScheme: 'light',
    } as CSSProperties & Record<`--${string}`, string>;
    return { reference, vars };
}

/** Common editable tokens for native and composed designs; geometry stays template-owned. */
export function getBuilderTheme(wedding: Wedding) {
    const visual = getTemplateVisualProfile(wedding.template, wedding.motif_color);
    const resolved = getInvitationTheme(wedding) || resolvePresentation(wedding, {
        layout: visual.isSharp ? 'classic' : 'native', accent: '#D16C78',
        paper: visual.isDark ? '#151315' : '#fff8f4', ink: visual.isDark ? '#fff8f0' : '#352c2c',
    });
    return Object.fromEntries(Object.entries(resolved.vars).filter(([key]) => key.startsWith('--invitation-')).map(([key, value]) => [key.replace('--invitation-', '--builder-'), value])) as Record<`--${string}`, string>;
}
