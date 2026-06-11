# QuickWeds Mobile Completion Plan

## Source

- Target: `/Users/romie/quickweds` `[from-code]`
- Date: 2026-06-09 `[from-code]`
- Active workflow: `mobile-resume` because `web-to-mobile-audit` classified the repo as `already-mobile` `[from-code]`
- Existing mobile stack: Capacitor iOS wrapper around the Next.js app, with `ios/`, `@capacitor/*` dependencies, `capacitor.config.ts`, and `cap:*` scripts `[from-code]`
- Web stack: Next.js + React, mixed App Router and Pages API routes `[from-code]`
- Mobile delivery target for this plan: harden the existing Capacitor/iOS app shell. This does not switch to Expo React Native unless explicitly approved as a separate migration `[inferred]`
- SDK version: not applicable to Expo; Capacitor package versions are declared in `package.json` `[from-code]`

## Audit Findings

- `node web-to-mobile-magic-plugin/scripts/web-repo-audit.mjs .` returned `inputClassification: "already-mobile"` because this repo already contains an iOS/Capacitor mobile surface `[from-code]`.
- `node web-to-mobile-magic-plugin/scripts/mobile-app-audit.mjs .` detected `Swift/iOS (detected via ios/ directory)` and app name `quickweds` `[from-code]`.
- Mobile scripts exist: `npm run cap:sync` maps to `cap sync ios`, and `npm run cap:open:ios` maps to `cap open ios` `[from-code]`.
- The Capacitor wrapper points at `https://quickweds.site` through `capacitor.config.ts`, so the iOS app currently behaves as a live-site shell rather than a fully bundled offline app `[from-code]`.
- The root layout includes `NativeAppChrome`, `PWAInstaller`, Analytics, and Speed Insights, so native-specific UI is already integrated into the app shell `[from-code]`.
- `NativeAppChrome` adds native root flags, listens for Capacitor app state, redirects `/` to `/dashboard` or `/login`, and shows a five-tab app navigation for authenticated non-public routes `[from-code]`.
- PWA assets and iOS assets exist under `public/icons/` and `ios/App/App/Assets.xcassets/` `[from-code]`.
- Public assets have been copied into `ios/App/App/public/`, including user-upload style media. This should be reviewed because bundled private or user-generated files may create release-size and privacy risk `[from-code]`.
- The audit reported 47 implemented files and 13 partial files, with 0 broken files `[from-code]`.
- The audit reported completion risks: `partial-screens`, `incomplete-markers-in-source`, `missing-eas-config`, and `auth-without-secure-storage` `[from-code]`.
- `missing-eas-config` is an Expo-oriented warning from the generic audit script. For this Capacitor plan, the equivalent release gap is missing documented iOS signing, archive, and TestFlight workflow `[inferred]`.
- The generic audit script scanned generated `.next/dev` files for incomplete markers. Those generated-file markers should not be treated as source TODOs; source-only review found regular form placeholders and benign `return null` branches, but the partial files still need targeted mobile QA `[inferred]`.
- Existing tests are Playwright web tests: `tests/auth.spec.ts`, `tests/builder.spec.ts`, and `tests/onboarding.spec.ts` `[from-code]`.

## Completion Status

| Area | Status | Evidence |
| --- | --- | --- |
| Mobile shell | Partial | `capacitor.config.ts` and `ios/` exist, but the app uses a remote `server.url` and needs release validation `[from-code]` |
| Native navigation | Partial | `src/components/NativeAppChrome.tsx` implements a native tab bar and root redirect, but needs route/device QA `[from-code]` |
| Screens | Partial | Audit found 47 implemented and 13 partial files, with no broken files `[from-code]` |
| API integration | Partial | Many Next API routes exist; mobile app depends on the hosted site/API and needs session/CORS/deep-link verification `[from-code]` |
| Auth | Partial | Supabase auth is present; the audit flagged `auth-without-secure-storage` for mobile session handling `[from-code]` |
| State and storage | Partial | Browser APIs including `localStorage`, `sessionStorage`, and `window` are used in source and need native-shell behavior checks `[from-code]` |
| Native permissions | Missing | Capacitor plugins for App, Browser, and Share are installed, but no explicit permission matrix or iOS usage review is documented `[from-code]` |
| Assets | Partial | App icons and splash assets exist; bundled `ios/App/App/public/uploads/` media needs review before release `[from-code]` |
| Tests | Partial | Three Playwright tests exist, but no mobile-shell or iOS simulator smoke test is documented `[from-code]` |
| Build config | Partial | `capacitor.config.ts` and Xcode project exist; release signing/TestFlight checklist is missing `[from-code]` |
| Broken items | Done | Audit found `brokenScreenCount: 0` `[from-code]` |

## Screen Inventory and Status

### Partial Priority Files

- `src/app/actions/support.ts` - partial `[from-code]`
- `src/app/admin/broadcast/page.tsx` - partial `[from-code]`
- `src/app/admin/users/page.tsx` - partial `[from-code]`
- `src/app/api/account/profile/route.ts` - partial `[from-code]`
- `src/app/api/planner/items/route.ts` - partial `[from-code]`
- `src/app/api/planner/load/route.ts` - partial `[from-code]`
- `src/app/api/seating/check-in/route.ts` - partial `[from-code]`
- `src/app/api/suppliers/profile/route.ts` - partial `[from-code]`
- `src/app/dashboard/[id]/page.tsx` - partial `[from-code]`
- `src/app/dashboard/[id]/planner/check-in/page.tsx` - partial `[from-code]`
- `src/app/dashboard/[id]/planner/page.tsx` - partial `[from-code]`
- `src/app/forgot-password/page.tsx` - partial `[from-code]`
- `src/app/login/page.tsx` - partial `[from-code]`

### Implemented Mobile-Relevant Files

- `src/app/layout.tsx` - implemented shell composition with `NativeAppChrome` and `PWAInstaller` `[from-code]`
- `src/components/NativeAppChrome.tsx` - implemented native app chrome component, pending simulator/device QA `[from-code]`
- `src/components/PWAInstaller.tsx` - implemented PWA prompt with native Capacitor guard `[from-code]`
- `src/lib/capacitor.ts` - implemented native platform detection helpers `[from-code]`
- `src/app/manifest.ts` - implemented PWA manifest and shortcuts `[from-code]`
- `capacitor.config.ts` - implemented Capacitor app identity and remote server config `[from-code]`
- `ios/App/App/AppDelegate.swift` - present iOS app delegate `[from-code]`
- `ios/App/App/Info.plist` - present iOS app metadata `[from-code]`
- `ios/App/App/Assets.xcassets/` - present app icon and splash assets `[from-code]`

## Implementation Checklist

- [ ] Review `ios/App/App/public/uploads/` and remove any user-generated, private, oversized, or demo-only files before release - verify with `find ios/App/App/public/uploads -type f | wc -l` and an asset-size review `[from-code]`
- [ ] Decide whether `capacitor.config.ts` should keep `server.url: "https://quickweds.site"` for a remote live app shell or use a bundled static build for offline-first behavior - verify with `npm run cap:sync` and an iOS simulator launch `[from-code]`
- [ ] Add a documented iOS release checklist for `ios/App/App.xcodeproj`, signing, archive, and TestFlight under `docs/mobile-resume/` - verify by opening the Xcode project with `npm run cap:open:ios` `[inferred]`
- [ ] Validate native auth flow in `src/components/NativeAppChrome.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/forgot-password/page.tsx`, and `src/app/auth/callback/page.tsx` - verify login/logout/password reset inside iOS simulator `[from-code]`
- [ ] Audit Supabase session persistence for Capacitor in `src/lib/supabase.ts` and auth pages; decide whether secure native storage is needed instead of browser storage - verify by quitting/reopening the simulator after login `[from-code]`
- [ ] Exercise native tab visibility rules in `src/components/NativeAppChrome.tsx` for `/dashboard`, `/builder`, `/suppliers`, `/user-guide`, `/settings`, `/w/:id`, `/seat/:token`, and auth routes - verify with simulator navigation screenshots `[from-code]`
- [ ] Verify public wedding flows in `src/app/w/[id]/page.tsx`, `src/app/w/[id]/photos/page.tsx`, `src/app/w/[id]/seat-finder/page.tsx`, and `src/app/seat/[token]/page.tsx` inside the Capacitor shell - verify RSVP, photo upload, and seat lookup manually `[from-code]`
- [ ] Verify planner flows in `src/app/dashboard/[id]/planner/page.tsx` and `src/app/dashboard/[id]/planner/check-in/page.tsx` on iPhone viewport and simulator - verify checklist, budget, food/drinks, honeymoon, schedule, guest check-in, and QR/paste workflows `[from-code]`
- [ ] Verify account/profile APIs in `src/app/api/account/profile/route.ts`, `src/app/api/planner/items/route.ts`, `src/app/api/planner/load/route.ts`, `src/app/api/seating/check-in/route.ts`, and `src/app/api/suppliers/profile/route.ts` with a mobile-authenticated session - verify requests succeed against production/staging API `[from-code]`
- [ ] Add mobile shell coverage to Playwright for native-preview mode using `?nativePreview=1` against `/dashboard`, `/builder`, `/suppliers`, `/user-guide`, and `/settings` - verify with `npx playwright test` `[from-code]`
- [ ] Add or document iOS simulator smoke steps for install, launch, login, dashboard redirect, tab navigation, share/open-external behavior, and app background/foreground - verify with `npm run cap:sync` then simulator testing `[inferred]`
- [ ] Run `npm run lint` and fix source issues that affect mobile shell paths - verify command exits 0 `[from-code]`
- [ ] Run `npm run build` before every `cap:sync` release pass - verify command exits 0 `[from-code]`

## Test Plan

- Run `npm run lint` to catch TypeScript/React lint issues `[from-code]`.
- Run `npm run build` to validate the Next.js production build used by the hosted app and/or Capacitor sync `[from-code]`.
- Run `npx playwright test` to cover existing auth, builder, and onboarding tests `[from-code]`.
- Add Playwright tests for native-preview tab chrome and auth/public route exclusion using `?nativePreview=1` `[inferred]`.
- Run `npm run cap:sync` after a passing build to refresh the iOS project `[from-code]`.
- Open `ios/App/App.xcodeproj` with `npm run cap:open:ios` and run an iPhone simulator smoke test `[from-code]`.
- Human QA must confirm real-device layout, safe-area spacing, tab-bar ergonomics, photo upload, QR/seat lookup, and auth persistence `[inferred]`.

## Build and Release Checklist

- [ ] Confirm Capacitor app id `com.quickweds.app` and display name `QuickWeds` in `capacitor.config.ts` `[from-code]`
- [ ] Confirm whether production mobile traffic should use `https://quickweds.site` or a staging host before release `[from-code]`
- [ ] Confirm required environment variables are configured in the hosted app: Supabase, Stripe, Resend, Google Calendar OAuth, Cloudinary, Sentry, and admin emails `[from-code]`
- [ ] Confirm iOS icons and splash assets in `ios/App/App/Assets.xcassets/` are final `[from-code]`
- [ ] Remove unintended files from `ios/App/App/public/uploads/` before archiving `[from-code]`
- [ ] Document Xcode signing team, bundle identifier, archive steps, and TestFlight handoff `[inferred]`
- [ ] Run a real-device smoke test before App Store submission `[assumption]`

## Acceptance Criteria

- `npm run lint` exits 0 `[from-code]`
- `npm run build` exits 0 `[from-code]`
- `npm run cap:sync` exits 0 `[from-code]`
- Existing Playwright tests pass with `npx playwright test` `[from-code]`
- Native-preview Playwright coverage exists for the mobile tab chrome and route exclusions `[inferred]`
- iOS simulator launches the app, routes `/` correctly, preserves auth across restart, and shows/hides native tabs correctly `[inferred]`
- Public wedding, dashboard, planner, supplier, auth, and support flows are manually verified in the Capacitor app shell `[inferred]`
- Release assets and bundled public files are reviewed and approved by a human `[assumption]`

## Approval

Implementation is not approved yet. Approve this plan before app-code changes.
