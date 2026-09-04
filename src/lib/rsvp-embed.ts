export const RSVP_EMBED_RESIZE_MESSAGE = 'quickweds:rsvp-resize';

export const RSVP_EMBED_FALLBACK_HEIGHT = 1400;
export const RSVP_EMBED_MIN_HEIGHT = 360;
export const RSVP_EMBED_MAX_HEIGHT = 5000;

export type RsvpInstallMethod = 'embed' | 'link';

export const RSVP_EMBED_PLATFORMS = [
    {
        value: 'wix',
        label: 'Wix',
        recommendedMethod: 'embed',
        instructions: [
            'Open the page where guests should RSVP.',
            'Add an Embed Code or HTML iframe element and paste the QuickWeds embed code.',
            'Stretch it to the page width, publish, then test the live page on mobile.',
        ],
    },
    {
        value: 'squarespace',
        label: 'Squarespace',
        recommendedMethod: 'embed',
        instructions: [
            'Edit your RSVP page and add a Code block.',
            'Paste the QuickWeds embed code into the block.',
            'Save the page, publish, and verify the form on desktop and mobile.',
        ],
    },
    {
        value: 'wordpress',
        label: 'WordPress',
        recommendedMethod: 'embed',
        instructions: [
            'Add a Custom HTML block to your RSVP page.',
            'Paste the QuickWeds embed code into the block.',
            'Update the page and test it. If your plan removes iframe code, use the RSVP link instead.',
        ],
    },
    {
        value: 'webflow',
        label: 'Webflow',
        recommendedMethod: 'embed',
        instructions: [
            'Add an Embed element to your RSVP page.',
            'Paste the QuickWeds embed code and save the element.',
            'Publish the site and test the live page at phone and desktop widths.',
        ],
    },
    {
        value: 'canva',
        label: 'Canva',
        recommendedMethod: 'link',
        instructions: [
            'Add an RSVP button or text link to your Canva website.',
            'Paste the QuickWeds RSVP link as the button destination.',
            'Publish the website and click the button to confirm the form opens.',
        ],
    },
    {
        value: 'gohighlevel',
        label: 'GoHighLevel',
        recommendedMethod: 'embed',
        instructions: [
            'Add a Custom HTML element to your RSVP page.',
            'Paste the QuickWeds embed code into the element.',
            'Save, publish, and test the live page on mobile.',
        ],
    },
    {
        value: 'systeme',
        label: 'Systeme.io',
        recommendedMethod: 'embed',
        instructions: [
            'Add a Raw HTML element to your RSVP page.',
            'Paste the QuickWeds embed code into the element.',
            'Save the page and verify the published version.',
        ],
    },
    {
        value: 'other',
        label: 'Other',
        recommendedMethod: 'link',
        instructions: [
            'Add an RSVP button or link to your existing website.',
            'Use the QuickWeds RSVP link as its destination.',
            'If your builder supports custom HTML, you can use the embed code instead.',
        ],
    },
] as const satisfies ReadonlyArray<{
    value: string;
    label: string;
    recommendedMethod: RsvpInstallMethod;
    instructions: readonly [string, string, string];
}>;

export type RsvpEmbedPlatform = typeof RSVP_EMBED_PLATFORMS[number]['value'];

export const RSVP_EMBED_PLATFORM_VALUES = RSVP_EMBED_PLATFORMS.map((platform) => platform.value);

export function getRsvpEmbedPlatform(value: string | null | undefined) {
    return RSVP_EMBED_PLATFORMS.find((platform) => platform.value === value) || null;
}

export function createRsvpEmbedCode(embedUrl: string, frameId: string) {
    if (!embedUrl) return '';

    const safeFrameId = `quickweds-rsvp-${frameId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    let allowedOrigin = '';
    let safeEmbedUrl = '';

    try {
        const parsedUrl = new URL(embedUrl);
        allowedOrigin = parsedUrl.origin;
        safeEmbedUrl = parsedUrl.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    } catch {
        return '';
    }

    return `<div style="width:100%;max-width:100%;overflow:hidden"><iframe id="${safeFrameId}" src="${safeEmbedUrl}" width="100%" height="${RSVP_EMBED_FALLBACK_HEIGHT}" style="width:100%;border:0;display:block" frameborder="0" loading="lazy" title="Wedding RSVP"></iframe></div>
<script>(function(){var frame=document.getElementById(${JSON.stringify(safeFrameId)});if(!frame)return;window.addEventListener('message',function(event){if(event.origin!==${JSON.stringify(allowedOrigin)}||event.source!==frame.contentWindow)return;var data=event.data||{};var height=Number(data.height);if(data.type!==${JSON.stringify(RSVP_EMBED_RESIZE_MESSAGE)}||!Number.isFinite(height))return;frame.style.height=Math.max(${RSVP_EMBED_MIN_HEIGHT},Math.min(${RSVP_EMBED_MAX_HEIGHT},Math.ceil(height)))+'px';});})();</script>`;
}
