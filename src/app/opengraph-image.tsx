import { ImageResponse } from 'next/og';

export const alt = 'QuickWeds — Free Wedding Website, Online RSVP & Wedding Planner';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #FFF8F4 0%, #FDE9ED 52%, #F7C5D0 100%)',
          color: '#3A2A2D',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#C06270',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 800,
              }}
            >
              Q
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em', color: '#3A2A2D' }}>
              QuickWeds
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '2px solid rgba(192, 98, 112, 0.22)',
              color: '#B25262',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Free to Start
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
              color: '#3A2A2D',
            }}
          >
            Wedding Websites, Online RSVPs & Planning in One Calm Place.
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 600,
              lineHeight: 1.4,
              color: '#6B5258',
            }}
          >
            60+ mobile-ready templates, QR Seat Finder, budget tracker, checklist & supplier directory.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            {['Websites', 'Smart RSVP', 'Seating QR', 'Budget', 'Suppliers'].map((pill) => (
              <div
                key={pill}
                style={{
                  display: 'flex',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: '#FFFFFF',
                  color: '#3A2A2D',
                  fontSize: '18px',
                  fontWeight: 700,
                  border: '1px solid rgba(192, 98, 112, 0.2)',
                }}
              >
                {pill}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#B25262' }}>
            www.quickweds.site
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
