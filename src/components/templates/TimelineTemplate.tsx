'use client';

import { 
    VideoSection, 
    BioSection, 
    DetailsSection, 
    CountdownTimer, 
    TimelineSection, 
    GallerySection, 
    GiftSection 
} from '../wedding';
import { SharedNewSections } from './shared';

export default function TimelineTemplate({ wedding, gallery, isExpired }: any) {
    return (
        <div className="bg-white pb-24">
            <section className="bg-neutral/30 py-24 sm:py-32 md:py-32 text-center px-4 sm:px-6">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-primary mb-8 px-4 sm:px-6">{wedding.bride_name} & {wedding.groom_name}</h1>
                <p className="text-xl sm:text-2xl font-serif italic text-primary/60">Our Story, In Time</p>
            </section>
            <TimelineSection timeline={wedding.program_timeline} />
            <BioSection wedding={wedding} />
            <GallerySection gallery={gallery} />
            <DetailsSection wedding={wedding} />
            <GiftSection wedding={wedding} />
            <SharedNewSections wedding={wedding} isExpired={isExpired} />
        </div>
    );
}
