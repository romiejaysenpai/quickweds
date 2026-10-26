// Kept in the local builder draft/undo history, never sent as wedding data.
export const UNCUSTOMIZED_DESIGN = { motifColor: false, fontStyle: false, sectionTitleFontStyle: false };
export const PRESERVED_DESIGN = { motifColor: true, fontStyle: true, sectionTitleFontStyle: true };

export function readBuilderDesignCustomization(value: unknown): typeof PRESERVED_DESIGN {
    if (!value || typeof value !== 'object') return { ...PRESERVED_DESIGN };
    const record = value as Record<string, unknown>;
    return {
        motifColor: record.motifColor !== false,
        fontStyle: record.fontStyle !== false,
        sectionTitleFontStyle: record.sectionTitleFontStyle !== false,
    };
}

type DesignSelection = {
    motifColor: string;
    fontStyle: string;
    sectionTitleFontStyle: string;
    designCustomization?: typeof UNCUSTOMIZED_DESIGN;
};

type ReferenceSelection = { id: string; templateId: string; accent: string; fontStyle?: string; titleFontStyle?: string };

export function selectBuilderReference<T extends DesignSelection>(previous: T, reference: ReferenceSelection): T & { template: string; templateStyle: string } {
    // Older drafts have no tracking metadata: preserve their choices conservatively.
    const customized = readBuilderDesignCustomization(previous.designCustomization);
    return {
        ...previous,
        template: reference.templateId,
        templateStyle: reference.id,
        motifColor: customized.motifColor ? previous.motifColor : reference.accent,
        fontStyle: customized.fontStyle ? previous.fontStyle : reference.fontStyle || previous.fontStyle,
        sectionTitleFontStyle: customized.sectionTitleFontStyle ? previous.sectionTitleFontStyle : reference.titleFontStyle || 'default',
    };
}

export function getBuilderRecapSettings(formData: { showPhotosInThankYouMode?: boolean; showGuestbookInThankYouMode?: boolean; photoRecapStyle?: string }) {
    return {
        show_photos_in_thank_you_mode: formData.showPhotosInThankYouMode !== false,
        show_guestbook_in_thank_you_mode: formData.showGuestbookInThankYouMode !== false,
        photo_recap_style: formData.photoRecapStyle || 'polaroid',
    };
}
