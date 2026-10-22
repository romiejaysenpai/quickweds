import ManageRsvp from './ManageRsvp';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage your RSVP', robots: { index: false, follow: false }, referrer: 'no-referrer' };
// Runs while the document is parsed, before hydration and afterInteractive analytics.
// Capability stays in memory and never enters query strings, storage, or analytics URLs.
const capture = `(function(){if(location.hash){window.__quickwedsRsvpFragment=location.hash;history.replaceState(history.state,'',location.pathname+location.search);}})();`;
export default function ManageRsvpPage() {
    return <><script dangerouslySetInnerHTML={{ __html: capture }} /><ManageRsvp /></>;
}
