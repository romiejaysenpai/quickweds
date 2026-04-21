'use client';

import { SharedNewSections } from './shared';
import { 
    VideoSection, 
    BioSection, 
    DetailsSection,
    TimelineSection, 
    GallerySection, 
    GiftSection 
} from '../wedding';

export default function RSVPFocusTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white pb-24">
            <section className="bg-primary/5 py-24 sm:py-32 md:py-32 text-center px-4 sm:px-6">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-primary mb-8 px-4 sm:px-6">Join Us</h1>
                <p className="text-xl sm:text-2xl font-serif italic text-primary/60">Your presence is our greatest gift</p>
                <div className="mt-12">
                   <a href="#rsvp" className="px-12 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform inline-block min-h-[44px] flex items-center justify-center">RSVP HERE</a>
                </div>
            </section>
            <DetailsSection wedding={wedding} />
            <BioSection wedding={wedding} />
            <TimelineSection timeline={wedding.program_timeline} />
            <GallerySection gallery={gallery} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
