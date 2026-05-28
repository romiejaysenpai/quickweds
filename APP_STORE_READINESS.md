# QuickWeds App Store Readiness

## Current status

- Web app builds successfully with `npm run build` when Google Fonts are reachable.
- Lint completes with warnings only.
- PWA basics are present: manifest, icons, Apple web app metadata, service worker, offline route, and install prompt.
- Privacy, terms, cookies, and support pages exist.
- Capacitor iOS scaffold exists in `ios/`.
- Native bundle id is `com.quickweds.app`.
- The iOS shell is configured to load `https://quickweds.site`.
- Account deletion is available from Settings and backed by `/api/account/delete`.
- Stripe upgrade buttons are hidden inside the iOS Capacitor app, and the checkout endpoint rejects the iOS Capacitor client.
- Native app shell is present for Capacitor/iOS: app-first root redirect, native safe-area handling, iOS-style bottom tabs, and hidden PWA install prompts.
- Settings exposes Privacy Policy, Terms, Support, and Delete Account in-app.
- Production debug/test API endpoints are blocked outside development.
- Workspace copy now uses app-friendly wording like "Guest View" instead of "Live Site".
- iOS payment policy for first submission: the native app does not sell digital planner/account upgrades. Paid upgrade buttons are hidden in the iOS shell and checkout rejects iOS app clients.
- Capacitor native plugins added and synced: App, Browser, and Share.
- iOS AppIcon contains a 1024x1024 universal icon, and Info.plist declares `ITSAppUsesNonExemptEncryption=false`.
- Xcode project resolves packages and builds successfully for iPhone 17 Simulator with code signing disabled.
- Simulator launch was verified, but the app currently loads the deployed `https://quickweds.site` build from `capacitor.config.ts`. Deploy these repo changes before doing the final visual native-app QA pass.

## App Store blockers to resolve

- Apple Developer Program membership and App Store Connect app record are still needed.
- Xcode signing team, provisioning, app capabilities, and release archive are still needed. This cannot be completed until the Apple Developer account/team is ready.
- App Store 1024x1024 icon and screenshots are still needed.
- A reviewer demo account is needed.
- Stripe checkout still unlocks digital planner/account features on the web app. For first iOS submission, keep paid upgrade entry points hidden in the iOS app unless/until Apple In-App Purchase is implemented.
- Apple Sign In buttons exist, but provider configuration must be verified in Supabase and Apple Developer before review.

## Suggested next implementation tasks

1. Test account deletion on a disposable staging/demo account.
2. Verify the iOS app does not show paid upgrade buttons in TestFlight.
3. Run a full hands-on iPhone Simulator pass for native shell polish:
   - login/signup/auth callback
   - dashboard and workspace tabs
   - builder forms and iOS keyboard
   - planner tabs and bottom navigation overlap
   - RSVP/public wedding pages
   - settings/privacy/terms/support/delete account
4. Long-term iOS payment policy:
   - Current first-submission policy is free iOS app with no visible digital upgrade purchasing.
   - If QuickWeds needs to sell planner/account unlocks inside iOS later, implement Apple In-App Purchase before exposing those buttons in the native app.
5. Add native app polish with Capacitor plugins where useful:
   - App plugin for native app state/events
   - Browser plugin for external auth/payment handoffs if needed
   - Share plugin for wedding URLs
   - Push Notifications later, after review basics are stable
6. Configure Xcode signing and app icons.
7. Upload a TestFlight build and test the full wedding creation, RSVP, login, upload, deletion, and payment-safe flows.

## Useful commands

```bash
npm run build
npm run lint
npm run cap:sync
npm run cap:open:ios
```
