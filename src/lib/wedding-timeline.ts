export type TimelineIconKind = 'ceremony' | 'drinks' | 'meal' | 'photo' | 'music' | 'celebration';
const FALLBACK: readonly TimelineIconKind[] = ['ceremony', 'drinks', 'photo', 'meal', 'music', 'celebration'];

/** Familiar event labels get a meaningful icon; free-form labels keep a decorative fallback. */
export function timelineIconKind(event: string, index = 0): TimelineIconKind {
    const label = event.toLocaleLowerCase();
    if (/photo|portrait|фото|retratos/.test(label)) return 'photo';
    if (/cocktail|drinks|toast|canap[eé]|brindis|коктейл|фуршет/.test(label)) return 'drinks';
    if (/dinner|banquet|lunch|meal|supper|cena|banquete|банкет|ужин/.test(label)) return 'meal';
    if (/dance|dancing|music|disco|baile|танц|дискот/.test(label)) return 'music';
    if (/ceremony|vows|registration|ceremonia|церемон|регистрац|венчан/.test(label)) return 'ceremony';
    if (/cake|party|firework|farewell|торт|салют|завершен/.test(label)) return 'celebration';
    return FALLBACK[((index % FALLBACK.length) + FALLBACK.length) % FALLBACK.length];
}
