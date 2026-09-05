# QuickWeds product implementation status

This handoff maps the product investigation recommendations to the implementation in this workspace. It distinguishes completed software from deployment and business work so launch decisions are based on evidence.

## Recommendation coverage

| ID | Delivered behavior | Status |
|---|---|---|
| R01 | Signup preserves the intended destination; email-confirmation users get an honest waiting state; onboarding captures site, planning, guest, or coordinator intent. | Implemented |
| R02 | Weddings save privately by default, publish separately, autosave to a private server draft, offer restore/discard, and clear the draft after a successful save. | Implemented; newly selected local files still upload on final save |
| R03 | Builder starts with essentials and exposes full customization on request. | Implemented |
| R04 | Imported households receive stable private invitation links and update the same RSVP with optimistic version checks. | Implemented |
| R05 | Server validation prevents contradictory counts; declines clear irrelevant answers; each attendee can have a name, age group, meal, and allergy details. | Implemented |
| R06 | External RSVP has a dedicated embed route, allowed-origin settings, CSP frame controls, and a link to the full invitation for richer questions. | Implemented |
| R07 | A no-account private guest pass supports RSVP edits, directions, calendar, seat finding, photos, album access, and help details. | Implemented |
| R08 | Invitation generation is explicitly non-sending; private links are named; QR images are generated inside QuickWeds. | Implemented |
| R09 | Approved messages enter a durable queue with claim locks, retries, cancellation, idempotency keys, and accepted/failed states. | Implemented; provider delivery/bounce webhooks remain provider-specific operations work |
| R10 | Event timezone is stored and used for RSVP closure, countdowns, and calendar timestamps, including DST validation. | Implemented |
| R11 | Coordinator totals distinguish households from people; imports report created/skipped rows and party totals. | Implemented |
| R12 | Assignment, removal, table rename, capacity validation, and table deletion are database-atomic and keep legacy table labels synchronized. | Implemented |
| R13 | Camera policy allows QR scanning; typed code lookup remains available; mobile flow is regression-tested. | Implemented |
| R14 | Coordinator can download a standalone private roster with seating and vendor contacts for offline handover. | Implemented; offline edits intentionally deferred until field pilots show they are needed |
| R15 | Coordinator portfolio aggregates owned and accepted weddings and routes each exception to the correct wedding workspace. | Implemented |
| R16 | Playbooks reuse relative task dates; owners and due times are actionable; date changes require a preview and selected-task approval. | Implemented |
| R17 | Vendor balances use recorded payments, expose unknown history, reject overpayment, and avoid linked budget/vendor double counting. | Implemented |
| R18 | Vendor brief links expose only their instructions and require versioned acknowledgment. | Implemented |
| R19 | Guest photo access follows the private guest pass; multi-file compression/upload supports per-file retry and stable upload intent IDs. | Implemented |
| R20 | Temporary helper links expire, expose a minimal confirmed roster, allow check-in only, and can be revoked. | Implemented |
| R21 | Existing thank-you generation stays review-first; closeout shows the remaining recipient queue. | Implemented |
| R22 | Account and wedding upgrade scopes are separated in copy, checkout metadata, and price configuration. | Implemented; professional pilot packaging and price research are business work |
| R23 | Payment success is shown only after an authenticated Stripe session check and entitlement verification; uncertain states tell users not to repay. | Implemented |
| R24 | Closeout reviews failures, balances, thank-yous, photos, exports a private archive, enables memories mode, cancels queued work, revokes helpers, and archives the wedding. | Implemented |
| R25 | Private product events cover drafts, publication, RSVP completion, verified upgrades, closeout, and post-value referrals; completed weddings can share a referral link. | Implemented |

## Release sequence

1. Review and apply `supabase/migrations/20260905162952_product_intelligence_foundation.sql` before deploying application code. The application reads the new timezone and attendee columns.
2. Configure `CRON_SECRET`, the production rate-limit service, Resend, and Stripe prices. The repository uses a daily delivery safety run compatible with Vercel Hobby; configure a faster external scheduler or upgrade the Vercel plan before promising time-sensitive automated delivery.
3. Deploy to a preview environment and run the migration-backed and browser flow tests there.
4. Send internal test invitations, reminders, helper links, vendor briefs, and payment test sessions. Confirm provider acceptance, expiry, cancellation, and retry behavior.
5. Pilot the coordinator workspace on real events before adding offline writes or optimization features that the investigation explicitly rejected.

## Verification recorded locally

- Production compilation and static generation passed for all 95 app pages using non-network placeholder values for the two absent local production rate-limit variables.
- TypeScript passed with no errors.
- Four end-to-end browser tests passed: ten-wedding portfolio routing, mobile RSVP decline and honest receipt, offline handover export, and internal QR/camera/auth boundaries.
- The migration executed in an isolated Postgres-compatible database. Tests passed for invitation identity and party allowance, attendee persistence, atomic seating capacity/rename/delete, payment idempotency, queue claiming, and private grants.

No production migration, deployment, payment, invitation, reminder, vendor message, or guest message was executed from this workspace.
