'use client';

import React, { useState } from 'react';
import { X, Check, Heart, Mail, Sparkles, Shirt, UtensilsCrossed, Phone, Eye, Edit3 } from 'lucide-react';
import {
    EntourageProposalTemplateKey,
    EntourageCardThemeKey,
    ENTOURAGE_PROPOSAL_TEMPLATES,
    ENTOURAGE_CARD_THEMES,
    getEntourageProposalTemplate,
    getEntourageCardTheme,
} from '@/lib/entourage-proposal-templates';
import { WeddingPartyMember } from '@/types/wedding';

interface EntourageProposalCustomizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: WeddingPartyMember;
    onSave: (updatedMember: WeddingPartyMember) => void;
    coupleNames?: string;
    weddingDate?: string;
    venueName?: string;
}

export function EntourageProposalCustomizerModal({
    isOpen,
    onClose,
    member,
    onSave,
    coupleNames = 'Bride & Groom',
    weddingDate = 'To be announced',
    venueName = 'To be announced',
}: EntourageProposalCustomizerModalProps) {
    if (!isOpen) return null;

    return (
        <EntourageProposalCustomizerModalContent
            key={member.id}
            onClose={onClose}
            member={member}
            onSave={onSave}
            coupleNames={coupleNames}
            weddingDate={weddingDate}
            venueName={venueName}
        />
    );
}

function EntourageProposalCustomizerModalContent({
    onClose,
    member,
    onSave,
    coupleNames = 'Bride & Groom',
    weddingDate = 'To be announced',
    venueName = 'To be announced',
}: Omit<EntourageProposalCustomizerModalProps, 'isOpen'>) {
    const [templateKey, setTemplateKey] = useState<EntourageProposalTemplateKey>(
        member.proposalTemplateKey || 'heartfelt'
    );
    const [cardTheme, setCardTheme] = useState<EntourageCardThemeKey>(
        member.proposalCardTheme || 'classic'
    );
    const [title, setTitle] = useState<string>(
        member.proposalTitle || getEntourageProposalTemplate(member.proposalTemplateKey).defaultTitle
    );
    const [message, setMessage] = useState<string>(
        member.proposalMessage || getEntourageProposalTemplate(member.proposalTemplateKey).defaultMessage
    );
    const [requestAttireSize, setRequestAttireSize] = useState<boolean>(
        member.requestAttireSize !== undefined ? member.requestAttireSize : true
    );
    const [requestDietaryNotes, setRequestDietaryNotes] = useState<boolean>(
        member.requestDietaryNotes !== undefined ? member.requestDietaryNotes : true
    );
    const [requestPhoneNumber, setRequestPhoneNumber] = useState<boolean>(
        member.requestPhoneNumber !== undefined ? member.requestPhoneNumber : false
    );
    const [activeViewTab, setActiveViewTab] = useState<'edit' | 'preview'>('edit');

    const activeTheme = getEntourageCardTheme(cardTheme);

    const handleTemplateChange = (newKey: EntourageProposalTemplateKey) => {
        setTemplateKey(newKey);
        const template = getEntourageProposalTemplate(newKey);
        setTitle(template.defaultTitle);
        setMessage(template.defaultMessage);
    };

    const handleSave = () => {
        onSave({
            ...member,
            proposalTemplateKey: templateKey,
            proposalCardTheme: cardTheme,
            proposalTitle: title,
            proposalMessage: message,
            requestAttireSize,
            requestDietaryNotes,
            requestPhoneNumber,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border/60 bg-neutral/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg font-bold text-foreground">
                                Customize Proposal for {member.name || 'Entourage Member'}
                            </h2>
                            <p className="text-xs text-text-secondary">
                                Role: <span className="font-bold">{member.role || 'Wedding Party'}</span>
                            </p>
                        </div>
                    </div>

                    {/* View Switcher Mobile/Tablet Tabs */}
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-xl border border-border bg-neutral/60 p-1 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setActiveViewTab('edit')}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                                    activeViewTab === 'edit'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-text-secondary hover:text-foreground'
                                }`}
                            >
                                <Edit3 className="h-3.5 w-3.5" /> Customize
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveViewTab('preview')}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                                    activeViewTab === 'preview'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-text-secondary hover:text-foreground'
                                }`}
                            >
                                <Eye className="h-3.5 w-3.5" /> Live Preview
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-2 text-text-secondary hover:bg-neutral hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="grid flex-1 overflow-y-auto lg:grid-cols-2">
                    {/* Left Column: Edit Settings */}
                    <div className={`space-y-5 p-6 ${activeViewTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                        {/* Preset Tone Dropdown */}
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                                Proposal Tone & Preset
                            </label>
                            <select
                                value={templateKey}
                                onChange={(e) => handleTemplateChange(e.target.value as EntourageProposalTemplateKey)}
                                className="mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                            >
                                {ENTOURAGE_PROPOSAL_TEMPLATES.map((tmpl) => (
                                    <option key={tmpl.key} value={tmpl.key}>
                                        {tmpl.label} — {tmpl.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Card Visual Theme Picker */}
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                                Proposal Card Theme Style
                            </label>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {Object.values(ENTOURAGE_CARD_THEMES).map((theme) => {
                                    const isSelected = cardTheme === theme.key;
                                    return (
                                        <button
                                            key={theme.key}
                                            type="button"
                                            onClick={() => setCardTheme(theme.key)}
                                            className={`relative flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                                                    : 'border-border bg-white hover:border-primary/40'
                                            }`}
                                        >
                                            <div className={`h-4 w-full rounded-md bg-gradient-to-r ${theme.previewBg}`} />
                                            <span className="text-xs font-bold text-foreground">{theme.label}</span>
                                            {isSelected && (
                                                <div className="absolute right-2 top-2 rounded-full bg-primary p-0.5 text-white">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Proposal Headline */}
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                                Proposal Card Title / Headline
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Will you stand by our side?"
                                className="mt-1.5 w-full rounded-xl border border-border px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                            />
                        </div>

                        {/* Custom Message */}
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                                Personal Message
                            </label>
                            <textarea
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write a warm note for your entourage member..."
                                className="mt-1.5 w-full resize-none rounded-xl border border-border px-3.5 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Custom Requested Answers from Recipient */}
                        <div className="rounded-2xl border border-border bg-neutral/30 p-4 space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                                Request Details Upon Acceptance
                            </p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 text-xs font-semibold text-foreground cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={requestAttireSize}
                                        onChange={(e) => setRequestAttireSize(e.target.checked)}
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <Shirt className="h-4 w-4 text-primary/70" />
                                    Ask for Attire / Suit / Dress Size
                                </label>
                                <label className="flex items-center gap-3 text-xs font-semibold text-foreground cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={requestDietaryNotes}
                                        onChange={(e) => setRequestDietaryNotes(e.target.checked)}
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <UtensilsCrossed className="h-4 w-4 text-primary/70" />
                                    Ask for Dietary Restrictions & Allergies
                                </label>
                                <label className="flex items-center gap-3 text-xs font-semibold text-foreground cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={requestPhoneNumber}
                                        onChange={(e) => setRequestPhoneNumber(e.target.checked)}
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <Phone className="h-4 w-4 text-primary/70" />
                                    Ask for Phone / WhatsApp Number
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Card Preview */}
                    <div className={`border-l border-border/60 bg-neutral/20 p-6 ${activeViewTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
                        <div className="sticky top-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                                    <Eye className="h-3.5 w-3.5 text-primary" /> Recipient Live Preview
                                </span>
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${activeTheme.badgeBg} ${activeTheme.badgeText}`}>
                                    {activeTheme.label}
                                </span>
                            </div>

                            {/* Simulated Proposal Webpage Card */}
                            <div className={`overflow-hidden rounded-3xl border ${activeTheme.borderClass} ${activeTheme.cardBg} p-6 shadow-lg transition-all`}>
                                <div className="text-center space-y-4">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral/50">
                                        <Heart className="h-6 w-6 text-primary animate-pulse" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                                            Wedding Entourage Proposal
                                        </span>
                                        <h3 className={`mt-1 font-serif text-2xl font-bold ${activeTheme.textPrimary}`}>
                                            {coupleNames}
                                        </h3>
                                        <p className="mt-1 text-xs text-text-secondary">
                                            Invites <span className="font-bold text-foreground">{member.name || 'Recipient Name'}</span> as{' '}
                                            <span className="font-bold text-primary">{member.role || 'Entourage Member'}</span>
                                        </p>
                                    </div>

                                    {/* Headline Banner */}
                                    <div className={`rounded-2xl ${activeTheme.bgClass} border ${activeTheme.borderClass} p-4`}>
                                        <h4 className={`font-serif text-base font-bold ${activeTheme.textPrimary}`}>
                                            &quot;{title}&quot;
                                        </h4>
                                        <p className={`mt-2 text-xs leading-relaxed ${activeTheme.textSecondary}`}>
                                            {message}
                                        </p>
                                    </div>

                                    {/* Date & Venue Banner */}
                                    <div className="rounded-xl border border-border bg-neutral/40 p-3 text-center text-xs text-text-secondary">
                                        📅 {weddingDate} &nbsp;&bull;&nbsp; 📍 {venueName}
                                    </div>

                                    {/* Preview Requested Info Fields */}
                                    {(requestAttireSize || requestDietaryNotes || requestPhoneNumber) && (
                                        <div className="space-y-2 text-left rounded-xl border border-dashed border-border p-3 text-xs bg-neutral/20">
                                            <p className="font-bold text-text-secondary text-[10px] uppercase">Recipient Response Form Preview:</p>
                                            {requestAttireSize && (
                                                <div className="flex items-center gap-2 text-text-secondary">
                                                    <Shirt className="h-3.5 w-3.5 text-primary" />
                                                    <span>Attire / Size input requested</span>
                                                </div>
                                            )}
                                            {requestDietaryNotes && (
                                                <div className="flex items-center gap-2 text-text-secondary">
                                                    <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                                                    <span>Dietary preferences input requested</span>
                                                </div>
                                            )}
                                            {requestPhoneNumber && (
                                                <div className="flex items-center gap-2 text-text-secondary">
                                                    <Phone className="h-3.5 w-3.5 text-primary" />
                                                    <span>Phone number input requested</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons Mock */}
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold ${activeTheme.accentClass}`}>
                                            <Check className="h-3.5 w-3.5" /> Accept
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-2.5 text-xs font-bold text-text-secondary">
                                            Decline
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-border/60 bg-neutral/20 px-6 py-4">
                    <p className="text-xs text-text-secondary hidden sm:block">
                        This theme and message will be applied to this entourage proposal.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-neutral transition-colors min-h-[44px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all min-h-[44px]"
                        >
                            <Check className="h-4 w-4" /> Save Proposal Customization
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
