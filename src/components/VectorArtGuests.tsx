'use client';

export default function VectorArtGuests({ color = '#333333' }: { color?: string }) {
    return (
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[250px] drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.15" />
                </filter>
            </defs>
            {/* Ambient Background Glow */}
            <circle cx="100" cy="100" r="80" fill={color} fillOpacity="0.05" />
            
            <g filter="url(#shadow)">
                {/* Man Silhouette */}
                {/* Head */}
                <path d="M70 50C78.2843 50 85 43.2843 85 35C85 26.7157 78.2843 20 70 20C61.7157 20 55 26.7157 55 35C55 43.2843 61.7157 50 70 50Z" fill="#94A3B8"/>
                {/* Suit/Tuxedo */}
                <path d="M45 60L70 100L95 60C100 70 100 120 100 180H40C40 120 40 70 45 60Z" fill={color} className="transition-colors duration-500 ease-out" />
                {/* Shirt Collar / Tie area */}
                <path d="M60 60L70 85L80 60L70 55L60 60Z" fill="#F8FAFC" />
                <path d="M70 65L72 80L70 95L68 80L70 65Z" fill="#0F172A" fillOpacity="0.8" />
                
                {/* Woman Silhouette */}
                {/* Head */}
                <path d="M130 45C138.284 45 145 38.2843 145 30C145 21.7157 138.284 15 130 15C121.716 15 115 21.7157 115 30C115 38.2843 121.716 45 130 45Z" fill="#94A3B8"/>
                {/* Hair */}
                <path d="M115 20C125 10 145 20 150 40C155 60 145 50 145 50C145 50 140 30 130 25C120 20 115 30 115 20Z" fill="#475569" />
                {/* Dress */}
                <path d="M120 50C115 65 100 120 90 180H170C160 120 145 65 140 50L130 70L120 50Z" fill={color} className="transition-colors duration-500 ease-out" />
                {/* Dress detailing / Waistline shape */}
                <path d="M130 70L115 80C120 95 140 95 145 80L130 70Z" fill="white" fillOpacity="0.15" className="transition-opacity duration-500" />
            </g>
        </svg>
    );
}
