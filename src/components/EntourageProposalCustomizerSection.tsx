'use client';

import React, { useState, useEffect } from 'react';
import { Check, Heart, Sparkles, Shirt, UtensilsCrossed, Phone, Eye, ArrowLeft, Save, Image as ImageIcon, ImagePlus, Loader2 } from 'lucide-react';
import {
    ENTOURAGE_PROPOSAL_TEMPLATES,
    ENTOURAGE_CARD_THEMES,
    getEntourageProposalTemplate,
    getEntourageCardTheme,
} from '@/lib/entourage-proposal-templates';
import type { EntourageProposalTemplateKey, EntourageCardThemeKey } from '@/lib/entourage-proposal-templates';
import type { WeddingPartyMember } from '@/types/wedding';

interface EntourageProposalCustomizerSectionProps {
    member: WeddingPartyMember;
    onSave: (updatedMember: WeddingPartyMember) => void;
    onClose: () => void;
    coupleNames?: string;
    weddingDate?: string;
    venueName?: string;
    couplePhotoUrl?: string;
    weddingHeroImageUrl?: string;
    onUploadHeroImage?: (file: File) => Promise<string>;
}

export function EntourageProposalCustomizerSection({
    member,
    onSave,
    onClose,
    coupleNames = 'Bride & Groom',
    weddingDate = 'To be announced',
    venueName = 'To be announced',
    couplePhotoUrl = '',
    weddingHeroImageUrl = '',
    onUploadHeroImage,
}: EntourageProposalCustomizerSectionProps) {
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
    const [proposalHeroImage, setProposalHeroImage] = useState<string>(
        member.proposalHeroImage || couplePhotoUrl || weddingHeroImageUrl || ''
    );
    const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

    useEffect(() => {
        setTemplateKey(member.proposalTemplateKey || 'heartfelt');
        setCardTheme(member.proposalCardTheme || 'classic');
        setTitle(member.proposalTitle || getEntourageProposalTemplate(member.proposalTemplateKey).defaultTitle);
        setMessage(member.proposalMessage || getEntourageProposalTemplate(member.proposalTemplateKey).defaultMessage);
        setRequestAttireSize(member.requestAttireSize !== undefined ? member.requestAttireSize : true);
        setRequestDietaryNotes(member.requestDietaryNotes !== undefined ? member.requestDietaryNotes : true);
        setRequestPhoneNumber(member.requestPhoneNumber !== undefined ? member.requestPhoneNumber : false);
        setProposalHeroImage(member.proposalHeroImage || couplePhotoUrl || weddingHeroImageUrl || '');
    }, [member, couplePhotoUrl, weddingHeroImageUrl]);

    const activeTheme = getEntourageCardTheme(cardTheme);
    const isCustomHeroImage = Boolean(
        proposalHeroImage
        && proposalHeroImage !== couplePhotoUrl
        && proposalHeroImage !== weddingHeroImageUrl
    );

    const handleTemplateChange = (newKey: EntourageProposalTemplateKey) => {
        setTemplateKey(newKey);
        const template = getEntourageProposalTemplate(newKey);
        setTitle(template.defaultTitle);
        setMessage(template.defaultMessage);
    };

    const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !onUploadHeroImage) return;

        if (!file.type.startsWith('image/')) {
            alert('Please choose an image file.');
            return;
        }
        if (file.size > 12 * 1024 * 1024) {
            alert('Proposal header images must be 12MB or smaller.');
            return;
        }

        setUploadingHeroImage(true);
        try {
            setProposalHeroImage(await onUploadHeroImage(file));
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to upload the proposal header image.');
        } finally {
            setUploadingHeroImage(false);
        }
    };

    const handleSave = () => {
        onSave({
            ...member,
            proposalTemplateKey: templateKey,
            proposalCardTheme: cardTheme,
            proposalTitle: title,
            proposalMessage: message,
            proposalHeroImage,
            requestAttireSize,
            requestDietaryNotes,
            requestPhoneNumber,
        });
    };

    return (
        <div className="my-6 rounded-3xl border border-primary/20 bg-white p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Designer Section Header */}
            <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-neutral/50 text-text-secondary hover:bg-neutral hover:text-foreground transition-all"
                        title="Back to entourage list"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 items-center gap-1 rounded-md bg-primary/10 px-2 text-[10px] font-black uppercase tracking-wider text-primary">
                                <Sparkles className="h-3 w-3" /> Designer
                            </span>
                            <h3 className="font-serif text-xl font-bold text-foreground">
                                Entourage Proposal Designer
                            </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary">
                            Customizing card for <span className="font-bold text-foreground">{member.name || 'Entourage Member'}</span> ({member.role || 'Wedding Party'})
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-text-secondary hover:bg-neutral transition-colors min-h-[40px]"
                    >
                        Done / Close
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all min-h-[40px]"
                    >
                        <Save className="h-4 w-4" /> Save Design
                    </button>
                </div>
            </div>

            {/* Main Designer Grid: Controls vs Live Preview */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Controls (7 Columns) */}
                <div className="space-y-5 lg:col-span-7">
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

                    {/* Card Theme Picker */}
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                            Proposal Card Theme Style
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {Object.values(ENTOURAGE_CARD_THEMES).map((theme) => {
                                const isSelected = cardTheme === theme.key;
                                return (
                                    <button
                                        key={theme.key}
                                        type="button"
                                        onClick={() => setCardTheme(theme.key)}
                                        className={`relative flex flex-col gap-1.5 rounded-2xl border p-3 text-left transition-all ${
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

                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                            Proposal Email Header Photo
                        </label>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Use the couple photo or hero image already uploaded in Builder. This image appears at the top of the sent proposal email.
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {couplePhotoUrl && (
                                <button
                                    type="button"
                                    onClick={() => setProposalHeroImage(couplePhotoUrl)}
                                    className={`flex items-center gap-3 rounded-xl border p-2 text-left transition-all ${
                                        proposalHeroImage === couplePhotoUrl ? 'border-primary bg-primary/5 ring-2 ring-primary/25' : 'border-border bg-white hover:border-primary/40'
                                    }`}
                                >
                                    <img src={couplePhotoUrl} alt="Couple photo option" className="h-12 w-12 rounded-lg object-cover" />
                                    <span className="text-xs font-bold text-foreground">Couple photo</span>
                                </button>
                            )}
                            {weddingHeroImageUrl && weddingHeroImageUrl !== couplePhotoUrl && (
                                <button
                                    type="button"
                                    onClick={() => setProposalHeroImage(weddingHeroImageUrl)}
                                    className={`flex items-center gap-3 rounded-xl border p-2 text-left transition-all ${
                                        proposalHeroImage === weddingHeroImageUrl ? 'border-primary bg-primary/5 ring-2 ring-primary/25' : 'border-border bg-white hover:border-primary/40'
                                    }`}
                                >
                                    <img src={weddingHeroImageUrl} alt="Wedding hero photo option" className="h-12 w-12 rounded-lg object-cover" />
                                    <span className="text-xs font-bold text-foreground">Wedding hero image</span>
                                </button>
                            )}
                            {isCustomHeroImage && (
                                <button
                                    type="button"
                                    onClick={() => setProposalHeroImage(proposalHeroImage)}
                                    className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-2 text-left ring-2 ring-primary/25"
                                >
                                    <img src={proposalHeroImage} alt="Attached proposal header image" className="h-12 w-12 rounded-lg object-cover" />
                                    <span className="text-xs font-bold text-foreground">Attached image</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setProposalHeroImage('')}
                                className={`flex items-center gap-3 rounded-xl border p-2 text-left transition-all ${
                                    !proposalHeroImage ? 'border-primary bg-primary/5 ring-2 ring-primary/25' : 'border-border bg-white hover:border-primary/40'
                                }`}
                            >
                                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral text-text-secondary"><ImageIcon className="h-5 w-5" /></span>
                                <span className="text-xs font-bold text-foreground">No header photo</span>
                            </button>
                            {onUploadHeroImage && (
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/45 bg-primary/5 p-2 text-left transition-colors hover:bg-primary/10">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary">
                                        {uploadingHeroImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                                    </span>
                                    <span className="text-xs font-bold text-foreground">{uploadingHeroImage ? 'Uploading…' : 'Attach another image'}</span>
                                    <input type="file" accept="image/*" className="sr-only" disabled={uploadingHeroImage} onChange={(event) => void handleHeroImageUpload(event)} />
                                </label>
                            )}
                        </div>
                        {!couplePhotoUrl && !weddingHeroImageUrl && (
                            <p className="mt-2 text-xs text-text-secondary">Add a couple photo or hero image in Builder to include it here.</p>
                        )}
                    </div>

                    {/* Proposal Title / Headline */}
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

                    {/* Requested Information Questionnaire */}
                    <div className="rounded-2xl border border-border bg-neutral/30 p-4 space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                            Request Details Upon Acceptance
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <label className="flex items-center gap-2.5 rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/40">
                                <input
                                    type="checkbox"
                                    checked={requestAttireSize}
                                    onChange={(e) => setRequestAttireSize(e.target.checked)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <Shirt className="h-4 w-4 text-primary" />
                                Attire / Size
                            </label>
                            <label className="flex items-center gap-2.5 rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/40">
                                <input
                                    type="checkbox"
                                    checked={requestDietaryNotes}
                                    onChange={(e) => setRequestDietaryNotes(e.target.checked)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <UtensilsCrossed className="h-4 w-4 text-primary" />
                                Dietary / Allergies
                            </label>
                            <label className="flex items-center gap-2.5 rounded-xl border border-border bg-white p-3 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/40 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={requestPhoneNumber}
                                    onChange={(e) => setRequestPhoneNumber(e.target.checked)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <Phone className="h-4 w-4 text-primary" />
                                Contact Phone / WhatsApp Number
                            </label>
                        </div>
                    </div>
                </div>

                {/* Live Interactive Proposal Card Preview (5 Columns) */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-primary" /> Live Proposal Card Preview
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${activeTheme.badgeBg} ${activeTheme.badgeText}`}>
                                {activeTheme.label}
                            </span>
                        </div>

                        {/* Proposal Webpage Card Mock */}
                        <div className={`overflow-hidden rounded-3xl border ${activeTheme.borderClass} ${activeTheme.cardBg} p-6 shadow-lg transition-all`}>
                            {proposalHeroImage && (
                                <div className={`-mx-6 -mt-6 mb-6 flex justify-center border-b ${activeTheme.borderClass} ${activeTheme.bgClass} px-6 pb-5 pt-6`}>
                                    <div className="rounded-[1.15rem] border-2 border-white bg-white p-1 shadow-[0_12px_28px_rgba(47,39,38,0.22)] ring-1 ring-black/10">
                                        <img
                                            src={proposalHeroImage}
                                            alt="Proposal email header preview"
                                            className="h-32 w-32 rounded-[0.8rem] object-cover sm:h-36 sm:w-36"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="text-center space-y-4">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral/40">
                                    <Heart className="h-6 w-6 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                                        Wedding Entourage Proposal
                                    </span>
                                    <h4 className={`mt-1 font-serif text-2xl font-bold ${activeTheme.textPrimary}`}>
                                        {coupleNames}
                                    </h4>
                                    <p className="mt-1 text-xs text-text-secondary">
                                        Invites <span className="font-bold text-foreground">{member.name || 'Recipient Name'}</span> as{' '}
                                        <span className="font-bold text-primary">{member.role || 'Entourage Member'}</span>
                                    </p>
                                </div>

                                {/* Custom Title Banner */}
                                <div className={`rounded-2xl ${activeTheme.bgClass} border ${activeTheme.borderClass} p-4`}>
                                    <h5 className={`font-serif text-base font-bold ${activeTheme.textPrimary}`}>
                                        &ldquo;{title}&rdquo;
                                    </h5>
                                    <p className={`mt-2 text-xs leading-relaxed ${activeTheme.textSecondary}`}>
                                        {message}
                                    </p>
                                </div>

                                {/* Date & Venue Banner */}
                                <div className="rounded-xl border border-border bg-neutral/40 p-3 text-center text-xs text-text-secondary">
                                    📅 {weddingDate} &nbsp;&bull;&nbsp; 📍 {venueName}
                                </div>

                                {/* Requested Details Indicator */}
                                {(requestAttireSize || requestDietaryNotes || requestPhoneNumber) && (
                                    <div className="space-y-1.5 text-left rounded-xl border border-dashed border-border p-3 text-xs bg-neutral/20">
                                        <p className="font-bold text-text-secondary text-[10px] uppercase">Recipients will submit:</p>
                                        {requestAttireSize && (
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <Shirt className="h-3.5 w-3.5 text-primary" />
                                                <span>Attire / Suit size</span>
                                            </div>
                                        )}
                                        {requestDietaryNotes && (
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                                                <span>Dietary requirements / allergies</span>
                                            </div>
                                        )}
                                        {requestPhoneNumber && (
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <Phone className="h-3.5 w-3.5 text-primary" />
                                                <span>Phone / WhatsApp number</span>
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
        </div>
    );
}
