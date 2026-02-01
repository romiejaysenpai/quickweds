# Changelog - Wedding Builder Refinement

## [YYYY-MM-DD] - Refined Builder & Expanded Templates

### Fixed
- **BuilderForm.tsx**: Corrected JSX nesting errors in the Media step (case 4), preventing layout breakage.
- **RSVPFocusTemplate**: Fixed `RSVPForm` usage to correctly pass `weddingId` instead of the full wedding object, and handled `isExpired` state locally.

### Added
- **Templates**: Added 8 new wedding templates:
    1.  **Romantic**: Soft textures, script fonts, nostalgic framing.
    2.  **Luxury**: Magazine-style layout, large typography.
    3.  **Elopement**: Intimate, couple-focused design.
    4.  **Traditional**: Ornate details, majestic styling.
    5.  **Timeline**: Structured around the event schedule.
    6.  **RSVP Focus**: Prioritizes guest confirmation.
    7.  **Cinematic**: Video-forward layout.
    8.  **Elegance**: Minimal, sophisticated.
- **Media Upload**: Enhanced video upload section with remove functionality, better previews, and 50MB size validation.
- **Performance**: Optimized invitation generation by parallelizing media uploads, significantly reducing wait times.
- **Stability**: Increased Firebase Storage retry timeout to prevent errors on slower connections.

### Verified
- **Build**: Successfully built the project with `npm run build`.
