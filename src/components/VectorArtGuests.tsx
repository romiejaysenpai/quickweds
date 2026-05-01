'use client';

export default function VectorArtGuests({ color = '#333333' }: { color?: string }) {
    const accentColor = color || '#333333';

    return (
        <svg
            viewBox="0 0 240 240"
            fill="none"
            className="h-full w-full max-w-[280px] drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="120" cy="124" r="94" fill={accentColor} fillOpacity="0.08" className="transition-colors duration-500" />
            <circle cx="120" cy="124" r="78" stroke={accentColor} strokeOpacity="0.18" strokeWidth="1.5" className="transition-colors duration-500" />
            <path d="M52 184C76 205 164 205 188 184" stroke={accentColor} strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" className="transition-colors duration-500" />

            <g className="transition-colors duration-500">
                <path d="M70 62C76.8 48.3 96.5 49.7 101.3 64.4C104.6 74.6 98.5 88.5 86.4 88.5C74.5 88.5 65.2 72 70 62Z" fill="#B68B74" />
                <path d="M65.5 66.5C68.2 48.3 89.7 41.3 101.5 55.8C106.2 61.6 106.5 70.4 104.2 78.1C100.7 70.6 93.1 62.7 80.2 62.9C75 63 70.1 64.2 65.5 66.5Z" fill="#4B3433" />
                <path d="M67 95.5C72.1 90.9 78.6 88.4 86 88.4C93.6 88.4 101 91.2 106.5 96.4L103.5 122.5H69.2L67 95.5Z" fill="#F9F6F2" />
                <path d="M75.6 95.7L86.3 111.6L96.8 95.8L103.7 123H69.5L75.6 95.7Z" fill={accentColor} fillOpacity="0.88" />
                <path d="M70.5 120.8H102.3L115.4 199.5H56.6L70.5 120.8Z" fill={accentColor} className="transition-colors duration-500" />
                <path d="M70.5 120.8H102.3L108 154.8C95.1 149.9 78.4 149.5 64.8 154.7L70.5 120.8Z" fill="#FFFFFF" fillOpacity="0.14" />
                <path d="M57.2 199.5C62.9 168 68 143.4 70.5 120.8C79.6 132.8 93.3 132.8 102.3 120.8C104.4 143.2 109.2 168.1 115.2 199.5" stroke="#FFFFFF" strokeOpacity="0.26" strokeWidth="2" strokeLinecap="round" />

                <path d="M141 58C146.3 44.4 166.1 43.5 174 55.7C180.1 65.2 177.4 81.8 164.5 85.8C151.8 89.8 137.2 69.5 141 58Z" fill="#AA7B65" />
                <path d="M139.7 62.4C142.6 43.8 166.3 35.6 179 52.2C185.6 60.9 183.7 75.9 177 86.5C176.7 75.1 169.8 64.6 157.2 61.5C149.9 59.7 144.2 60 139.7 62.4Z" fill="#2F2525" />
                <path d="M139.8 97.5C146 91.5 154.2 88 163 88C171.5 88 179.1 91.3 184.5 97.5C181.7 121.2 177.3 155.2 176.2 199.5H149.4C148.5 157.8 143.4 121.1 139.8 97.5Z" fill="#1F2933" />
                <path d="M153.4 96.6L163 113.2L173.1 96.6L170.7 199.5H155.5L153.4 96.6Z" fill="#F8FAFC" />
                <path d="M161.5 116.2L166.1 116.1L168.7 199.5H158.7L161.5 116.2Z" fill={accentColor} className="transition-colors duration-500" />
                <path d="M139.8 97.5L153.4 96.6L158.5 124.8L142.2 115.8L139.8 97.5Z" fill="#374151" />
                <path d="M184.5 97.5L173.1 96.6L168.2 124.8L183 115.8L184.5 97.5Z" fill="#374151" />
                <path d="M128.5 199.5C131.6 157.8 135.3 124.3 139.8 97.5L149.4 199.5H128.5Z" fill="#111827" />
                <path d="M176.2 199.5L184.5 97.5C189.7 124.1 193.8 157.7 197.3 199.5H176.2Z" fill="#111827" />
            </g>

            <g stroke={accentColor} strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-500">
                <path d="M44 70C47 65 51 62 56 60" strokeOpacity="0.35" strokeWidth="2" />
                <path d="M194 64C199 65 204 68 207 73" strokeOpacity="0.35" strokeWidth="2" />
                <path d="M44 82L49 87L55 78" strokeOpacity="0.32" strokeWidth="2" />
                <path d="M196 86L201 91L208 80" strokeOpacity="0.32" strokeWidth="2" />
                <circle cx="121" cy="43" r="3" fill={accentColor} fillOpacity="0.35" stroke="none" />
                <circle cx="206" cy="141" r="3" fill={accentColor} fillOpacity="0.24" stroke="none" />
                <circle cx="35" cy="139" r="3" fill={accentColor} fillOpacity="0.24" stroke="none" />
            </g>
        </svg>
    );
}
