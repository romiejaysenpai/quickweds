# QuickWeds App Store Readiness

## Current status

- Web app builds successfully with `npm run build` and TypeScript compiles cleanly.
- Lint passes with 0 errors.
- Automated Playwright smoke tests, auth-routing tests, and security header tests pass.
- PWA basics are present: manifest, icons, Apple web app metadata, service worker, offline route, and install prompt.
- Privacy, terms, cookies, and support pages exist and are linked in Settings and footer.
- Capacitor iOS scaffold exists in `ios/` with native bundle ID `com.quickweds.app`.
- The iOS shell is configured to load `https://quickweds.site`.
- Account deletion is available directly inside Settings and backed by `/api/account/delete` with cascade cleanup.
- App Store payment compliance (Guideline 3.1.1):
  - Paid upgrade buttons (`UpgradeButton`) are hidden inside the iOS Capacitor app shell.
  - `/api/stripe/checkout` rejects requests carrying `x-quickweds-client: ios-capacitor` or `User-Agent: QuickWeds-iOS-App`.
- Native app shell is present for Capacitor/iOS: app-first root redirect, native safe-area handling, iOS-style bottom tabs, and hidden PWA install prompts.
- Capacitor native plugins synced: App, Browser, and Share.
- iOS `AppIcon.appiconset` contains a 1024x1024 universal icon, and `Info.plist` declares `ITSAppUsesNonExemptEncryption=false`.
- `Info.plist` provides privacy usage descriptions for `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, and `NSPhotoLibraryAddUsageDescription`.
- Xcode project development team configured to `8U9MJ9MLZY`.
- Xcode project passes `xcodebuild` validation for Release (`builtin-validationUtility -validate-for-store`).

## Remaining Steps for App Store Submission

1. **Deploy web changes**: Ensure the latest Next.js build is deployed to `https://quickweds.site` so that the live site loaded by the Capacitor shell reflects all current updates.
2. **App Store Connect record**: Create the app record under bundle ID `com.quickweds.app` in App Store Connect.
3. **App Store screenshots & metadata**: Prepare 6.7" (iPhone 16 Pro Max / 15 Pro Max) and 6.5" screenshots, description, keywords, support URL, and privacy policy URL.
4. **Reviewer demo credentials**: Provide a test account (email & password) in App Store Connect "App Review Information" with a pre-configured wedding so reviewers can immediately test the dashboard, guest list, and website builder.
5. **Xcode Release Archive & Upload**:
   - Open project in Xcode: `npm run cap:open:ios`
   - Select "Any iOS Device (arm64)" as target.
   - Run **Product > Archive**.
   - In Organizer, click **Distribute App > App Store Connect** to upload to TestFlight.

## Useful commands

```bash
npm run build
npm run lint
npm run test:smoke
npm run cap:sync
npm run cap:open:ios
```
