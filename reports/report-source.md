# QuickWeds product investigation

**Product Intelligence Lead assessment · 6 September 2026**

**Decision:** Concentrate the next 90 days on making the existing journey dependable: **PLAN → INVITE → RSVP → ORGANIZE → WEDDING DAY → MEMORIES.** Pause expansion of decorative and peripheral features until the operational foundation is trustworthy.

## Scope and evidence

This assessment combines a read-only investigation of the local QuickWeds source with the [live public product and pricing page](https://www.quickweds.site/). The source contains substantially more than a wedding website builder. Existing capabilities include imported guests, household/event RSVP fields, confirmation emails and guest passes, seating capacity checks, check-in, coordinator reports, checklist templates, supplier records, collaborators, photo moderation and reveal settings, and thank-you sending logs.

Evidence labels throughout:

- **Confirmed:** behavior directly visible in inspected source. This does not establish that the same version is deployed.
- **Risk:** a credible failure path requiring an integration or operational test.
- **Opportunity:** a proposed improvement, not a measured customer complaint or claim that every equivalent capability is absent.

No authenticated production wedding was modified; no invitations, reminders, purchases or database changes were made. The ten-wedding simulation is a scenario walkthrough of implemented workflows, not a load test or interviews with ten customers. Mobile conclusions are based on implementation and workflow inspection, not a completed device usability study. Production database constraints, external schedulers, delivery logs, analytics and willingness to pay remain unverified. A live HEAD request did not expose the security headers inspected locally; configuration risks below must not be represented as confirmed production failures.

## 1. Executive product assessment

**QuickWeds has enough feature breadth for a focused launch. It does not yet have enough demonstrated operational consistency to promise that the whole wedding is handled automatically.**

The most consequential defects sit between tools. A guest imported into the RSVP table can be rejected when responding. A reminder can fail but be recorded as sent. A coordinator report can present an invented deposit as fact. These are trust failures: a couple or coordinator will return to spreadsheets if they must independently verify the system.

| Perspective | Assessment | What would earn trust |
|---|---|---|
| Couple | Strong visual and planning coverage; too much setup and polish before first value. | Save an incomplete plan, invite a test guest, see a correct response, and know the next necessary action. |
| Coordinator | Useful single-wedding tools and shared weddings already exist; professional coordination is not a first-class account journey. | A prioritized queue across ten weddings, reusable procedures, accountable owners, accurate balances, and dependable handover. |
| Guest | No-account public interactions and emailed guest passes are good foundations; identity and context fragment across RSVP, seat finder and photos. | One recognizable link, one clear action at each stage, editable responses, directions and a reliable fallback. |
| Product/growth | Generous free publishing is a good activation mechanism. Pricing scope and operational proof need attention. | Charge for saved coordinator time and deeper planning value; measure successful wedding outcomes rather than feature clicks. |

The product should remember deadlines, reconcile changes and surface exceptions. People should make decisions about invitations, seating and communication tone. Automation should execute an approved rule, record its result and ask for attention only when needed.

For couples, healthy retention ends with a completed wedding and a useful memory handoff. For coordinators, retention means they choose QuickWeds for their next client. Guests should remember that the wedding was easy to attend; branding should be secondary to that experience.

## 2. Top 10 problems

| Rank | Problem and evidence | Consequence | Recommendation |
|---|---|---|---|
| 1 | **Confirmed:** RSVP rejects an existing same-name record, without distinguishing an imported pending invitation from a completed response. [S3] | Import → invite → RSVP can fail; unrelated people with the same name can also be rejected. | R04 |
| 2 | **Confirmed:** coordinator report assumes pending vendors are 50% paid. Budget commitment calculation also mixes estimates and paid vendors. [S7] | Incorrect balances and potentially duplicated expenses undermine operational trust. | R17 |
| 3 | **Confirmed:** guest reminder handler logs sends without inspecting the email result. Only marketing nurture is scheduled in the checked deployment file. External schedules are unknown. [S6] | Hosts may believe guests were notified when they were not. | R09 |
| 4 | **Confirmed configuration conflict:** camera use is disabled globally while QR scanner requests camera access. [S10] | The local deployment configuration can break the main day-of scan interaction. | R13 |
| 5 | **Risk:** seating assignment and RSVP table labels are updated separately. [S8] | Interrupted or concurrent changes can produce different seating answers across tools. | R12 |
| 6 | **Confirmed:** draft saves pass through publication checks; builder runs through ten steps and defaults to live. [S2] | Users cannot easily save an incomplete wedding; polishing competes with activation. | R02–R03 |
| 7 | **Confirmed:** account types are couple/supplier; goal selection does not change final destinations; returning-user login can discard requested context. [S1] | Coordinators lack an obvious entry point and users repeat navigation. | R01, R15 |
| 8 | **Confirmed:** household/plus-one questions overlap, event answers initially default Yes, and decline confirmation uses attendance-positive language. [S3] | Guests can submit or misunderstand contradictory attendance information. | R05 |
| 9 | **Confirmed configuration + observed gap:** no external RSVP widget contract found; current framing policy is same-origin. [S4] | A couple cannot assume QuickWeds RSVP works inside an existing external website. | R06 |
| 10 | **Confirmed:** account and wedding upgrades use the same configured price but cover different scopes; unverified payment state still displays success language. [S14] | Buyers may purchase the wrong scope or believe a failed/unconfirmed upgrade is complete. | R22–R23 |

The ranking reflects wedding impact and cross-workflow dependencies, not measured frequency. Offline resilience, photo friction and portfolio management remain important even though only ten issues fit this list.

## 3. Top 10 opportunities

These opportunities reuse the existing product wherever possible. Their full problem, flow, value, effort and priority appear in the referenced recommendation cards.

1. **One invitation identity from import through thank-you:** eliminate duplicate records and repeated guest identification. R04.
2. **Save a private wedding in minutes:** minimal setup with optional design later. R02–R03.
3. **A coordinator attention queue across owned and shared weddings:** show what needs action today. R15.
4. **Dependable reminders with visible outcomes:** approved schedules, retry, suppression and escalation. R09.
5. **A persistent guest hub:** RSVP receipt, calendar, directions, seat and photos in one place. R07.
6. **A verified day-of handover:** canonical seating, accurate balances, fresh data and a downloaded fallback. R12–R14, R17.
7. **Reusable planning procedures with real owners:** reduce ten copies of setup work. R16.
8. **Minimal vendor acknowledgments:** establish who is coming, where and when without creating a procurement system. R18.
9. **A photo handoff that preserves guest context:** fewer codes and fewer repeated uploads. R19.
10. **Professional pricing tied to recurring coordinator value:** portfolio operations rather than more decorative limits. R22, R25.

## Lifecycle investigation

This maps every requested area to observed friction, likely misunderstanding or failure, and the specific improvement. Mobile and growth implications are addressed in the recommendation cards and the opportunity sections below.

| Area | What currently exists | Friction or risk | Simplification/automation |
|---|---|---|---|
| Signup | Email, Google and Apple entry paths | Email signup without an immediate session redirects onward; a clear verification/resend state is not present in the inspected page. Returning users can lose their requested destination. | Explicit verification recovery and preserve context. R01 |
| Onboarding | Role → goal → ready | Three screens before work; goal changes presentation rather than destination; coordinator is not an account type. | One intent choice that opens the chosen task. R01, R15 |
| Wedding setup | Details, date, venues, RSVP settings | Full publication requirements also obstruct incomplete private saving; event timezone is not represented in inspected calendar input. | Private minimal draft; explicit event timezone. R02, R10 |
| Website creation | Ten-step editor, live preview, presets, health checks | Design choices precede basic invitation readiness; photo/monogram completion can feel mandatory; no durable general autosave found in inspected builder. | Essential path, autosave, separate optional polish. R02–R03 |
| RSVP | Public form, duplicate protection, events/households, notifications | Same-name rejection, no self-edit, inconsistent attendance defaults, deadline checked in UI but not server. | Invitation identity and one response model. R04–R05 |
| Embedded RSVP | RSVP component inside QuickWeds templates | Internal component is not an externally embeddable product; global headers prevent ordinary cross-origin framing. | A deliberately scoped external widget only if in launch scope. R06 |
| Guest management | CSV mapping/preview, groups and tracking | Imports and public replies do not share a safe reconciliation flow; RSVP rows are not necessarily person counts. | Household/person identity, merge review and explicit denominators. R04, R11 |
| Invitations / QR | Public wedding QR and personal guest-pass links | Users must understand which QR identifies a wedding versus a party; delivery outcomes are fragmented. | Labeled invitation/venue/staff actions and pre-send checks. R07–R09 |
| Seating planning | Visual tables, capacity checks, touch/keyboard behavior | Separate assignment/text writes and possible stale multi-user decisions; party members need clear representation. | Canonical transactional assignments and change review. R12 |
| QR seat finding | Personal token, venue lookup, code-only default | Code recall and fresh lookup can fail; finder repeats a QR above the lookup form. | Link straight to current table, large code entry fallback, help contact. R07, R13 |
| Wedding-day operations | Workspace, check-in/undo, emergency contacts, printable report | Camera policy conflict; manual refresh; offline page is not an offline roster; financial report uncertainty. | Device readiness, dated fallback, freshness, scoped helpers. R13–R14, R17 |
| Guest photo sharing | Compression, moderation, reveal settings, code prefill | One file chosen per upload path; mandatory code; seat-to-photo navigation loses code context. | Context-preserving batch queue and clear reveal status. R19 |
| Checklist | Twelve-month seed, due dates, notes, assignee text | Free-text owner does not establish a deliverable notification; date shifts and process reuse need review. | Identity-based ownership, playbooks and rebase preview. R16 |
| Budget | Estimates, vendors, status, summary views | Paid amounts inferred in report; estimates and payments mixed. | One expense record and actual payment ledger. R17 |
| Vendors | Directory, saved suppliers, contacts/notes | Contact storage does not prove arrival or deliverable acknowledgment. | One short vendor briefing and acknowledgment. R18 |
| Collaborators | Partner/coordinator roles and shared wedding acceptance | No narrow day-of helper role found; professional account journey is unclear. | Task-scoped access, expiring helper permissions and history. R15, R20 |
| Thank-you messages | Builder, preview/test, send logs and duplicate protection | Requires deliberate sending; automation must not guess attendance, gifts or relationships. | Suggested review queue, recipient checks and truthful outcomes. R21 |
| Post-wedding experience | Thank-you mode and album sharing | Closeout and retention promises are not an explicit lifecycle contract in inspected paths. | Deliberate memories transition, export, access review and archive. R24 |

## Recommendation cards

Effort is relative implementation scope, not a delivery estimate: Low = localized change; Medium = several connected flows; High = data-model, concurrency or durable synchronization work. Priority follows the requested P0–P4 scale. Conditional P0 means required before launching or advertising that particular workflow.

### R01 — Preserve intent through signup and onboarding

**Problem:** Couples and invited coordinators need to start a specific job, not learn account routing.

**Current friction:** Confirmed goal selection leaves the same builder/dashboard choices. Returning users with weddings are intentionally sent to the dashboard regardless of requested path. Sessionless email signup lacks a verification holding screen. [S1]

**Proposed solution:** Preserve a safe destination and invitation context through all auth methods. Offer a verification/resend state when required. Route “Guests” to guest setup and “Checklist” to planning after only essential wedding identification.

**User flow:** Follow invitation or choose goal → sign in/verify → land in that wedding and task → finish one useful action. Mobile keeps entered work through app switching.

**Value:** Faster activation, fewer support requests, less coordinator navigation.

**Effort:** Medium. **Priority:** P1; P0 for any reproduced signup completion failure.

### R02 — Make saving independent from publishing

**Problem:** Couples often know only the names and approximate date when starting.

**Current friction:** Confirmed submit handler checks publication health even for private saving. New data defaults to live; general durable autosave was not found. Session storage only preserves form data around a particular login path. [S2]

**Proposed solution:** Default to private; save incomplete drafts; autosave with visible saved/error state and recoverable media progress. Validate guest-critical details only on publish. Do not silently discard unsupported saved fields.

**User flow:** Enter names → draft saved → leave/reopen → continue → preview → explicitly publish when essentials pass.

**Value:** Protects effort, improves mobile interruption recovery and activation; lets coordinators stage weddings safely.

**Effort:** Medium. **Priority:** P0 for save/publication separation; P1 for complete autosave recovery.

### R03 — Reduce website setup to essentials first

**Problem:** Couples can mistake optional personalization for required work.

**Current friction:** Ten editor steps include monogram, media, dress code and gifts before final submission. Health scoring mixes guest essentials with decorative suggestions. [S2]

**Proposed solution:** Provide a short path: details → design default → RSVP settings → review/share. Keep current customization in an optional “Personalize” area. Separate “Guests can use this” from “More personal touches.”

**User flow:** Choose a design → supply essentials → test a guest preview → publish; return later for story, photos and styling.

**Value:** Shorter time to a useful site; fewer mobile taps; paid consideration starts after demonstrated value.

**Effort:** Medium. **Priority:** P1.

### R04 — Give every invitation a stable identity

**Problem:** Coordinators import guests before inviting them; guests need to respond and later correct answers.

**Current friction:** Same-name lookup rejects existing records. Public submission inserts rather than reconciling a pending invitation; name alone cannot safely identify a person. [S3]

**Proposed solution:** Use a scoped invitation/household token linked to existing guest records. Update responses through that token. Keep open RSVP as a deliberate alternative with unmatched responses for host review. Never merge solely by name.

**User flow:** Import household → review invitees → send private response link → guest confirms named members → response updates the same records → edit through receipt link → coordinator sees relevant changes.

**Value:** Removes rekeying, duplicate headcounts and guest support messages; the strongest coordinator activation improvement.

**Effort:** High. **Priority:** P0 for imported-guest response compatibility; P1 for complete self-service editing.

### R05 — Make attendance answers internally consistent

**Problem:** Guests cannot tell whether party size, plus-ones, children and event answers overlap.

**Current friction:** Overlapping household/name fields; default Yes event answers; attendance-positive decline confirmation; form/API guest limits differ; server does not enforce the selected RSVP deadline. [S3]

**Proposed solution:** One member list with per-event attendance and per-person meal/allergy answers when needed. Apply invitation allowances server-side. Declining skips irrelevant questions. Enforce deadlines using event timezone and offer a late-change contact/request path.

**User flow:** See invited names → confirm attendance → answer only relevant follow-ups → review a plain-language summary → receive matching confirmation.

**Value:** Correct catering and seating counts, fewer phone form fields, less guest embarrassment.

**Effort:** Medium to High. **Priority:** P0 for contradictory responses and validation; P1 for richer per-person answers.

### R06 — Treat external embedded RSVP as a separate delivery surface

**Problem:** Couples with an existing website may want QuickWeds guest operations without rebuilding it.

**Current friction:** No dedicated external widget route or installation contract found; same-origin framing policies conflict with this use. Internal template RSVP is already available. [S4]

**Proposed solution:** Reuse the canonical RSVP service in a minimal widget route, with explicitly permitted host origins, accessible resizing, source attribution and an “Open RSVP” fallback. Keep dashboard pages unembeddable.

**User flow:** Choose “Use on my existing site” → enter host → copy snippet → run installation test → complete test RSVP on mobile → see it in the same guest list.

**Value:** Removes migration work; enables coordinator adoption with clients' existing sites.

**Effort:** Medium. **Priority:** P1, or P0 if external embed is a launch commitment. Otherwise ship a direct RSVP link first.

### R07 — Make the existing guest pass the continuing guest hub

**Problem:** Guests repeatedly search messages for separate RSVP, directions, table and photo links.

**Current friction:** A guest pass already exists in confirmation emails, but later surfaces require renewed context and seat-to-photo navigation drops code context. [S5, S11]

**Proposed solution:** Extend the pass rather than create another app. Show relevant actions by stage: RSVP/edit, calendar/directions, current table, photos, album. Provide a readable short code and host contact without exposing other guest records.

**User flow:** Open invitation → reply → save the same link → reopen for arrival → see table → share photos → return for album.

**Value:** Fewer taps, no account requirement, memorable guest convenience and fewer coordinator questions.

**Effort:** Medium. **Priority:** P1.

### R08 — Make invitation and QR purpose explicit

**Problem:** Hosts can confuse a public wedding QR, a personal guest pass and staff scanning.

**Current friction:** Multiple QR flows already exist. An emailed guest-pass QR is rendered through a third-party URL containing the full pass link. [S5]

**Proposed solution:** Label three purposes: “Invitation,” “Find your seat” and “Staff check-in.” Before printing/sending, verify the destination, wedding identity, publication and guest access. Render personal QR assets under QuickWeds control so pass links are not sent to a separate QR service.

**User flow:** Choose purpose → preview as guest/staff → test scan → download or send → keep a printed short-link fallback.

**Value:** Prevents wrong-code printing, protects guest context and makes arrival instructions understandable.

**Effort:** Low to Medium. **Priority:** P1; P0 validation for QR workflows included at launch.

### R09 — Turn reminders into a dependable service

**Problem:** Couples and coordinators should not remember to chase replies or audit whether a reminder ran.

**Current friction:** Guest cron records a send even when the helper returns failure; narrow time windows can miss work; checked deployment schedule only includes marketing nurture. Manual reminder sends return aggregate counts. [S6]

**Proposed solution:** A durable per-recipient queue with approved schedules, catch-up, idempotency, delivery/failure states and bounded retries. Recheck attendance before sending; stop on response/cancellation; expose failed recipients and quota impact. Verify any external scheduler before replacing it.

**User flow:** Host approves schedule → preview next send → system sends only eligible recipients → retries transient failures → coordinator handles exceptions.

**Value:** Less chasing; truthful operational status; reliable paid value. Provider acceptance must be labeled separately from delivery.

**Effort:** High. **Priority:** P0 for false success and scheduler validation; P1 for complete automation.

### R10 — Store event time in the wedding's timezone

**Problem:** Traveling guests and remote coordinators may use devices in a different timezone.

**Current friction:** Inspected calendar helper interprets date/time in the viewer's local timezone before producing UTC calendar values. Reminder selection uses wedding date separately from time. [S6, S13]

**Proposed solution:** Store an explicit event timezone and derive calendar, countdown and reminder instants consistently. Preview all dependent changes if date, venue or timezone changes.

**User flow:** Host confirms venue timezone → guest sees venue-local time → calendar saves the correct instant → reminders follow that same event definition.

**Value:** Avoids wrong arrival times and missed scheduling; supports destination weddings.

**Effort:** Medium. **Priority:** P0 for calendar/reminder accuracy in supported markets.

### R11 — Make guest totals and import results explain themselves

**Problem:** Coordinators need persons, households and event attendance, not an ambiguous count of RSVP rows.

**Current friction:** Existing CSV mapping/preview is useful, but record, party and person counts can differ; imported records interact poorly with public replies. [S3, S9]

**Proposed solution:** Show invited people, responding households, confirmed people per event and unresolved records separately. Add import dry-run totals, saved column mappings, explicit duplicate review and undo. Reconcile changes through R04.

**User flow:** Upload → reuse mapping → review new/changed/ambiguous rows → import → resolve exceptions → compare catering total to confirmed people.

**Value:** Reduces spreadsheet reconciliation, wrong headcounts and repeated setup across ten weddings.

**Effort:** Medium. **Priority:** P1.

### R12 — Use one authoritative seating assignment

**Problem:** Coordinators and guests must receive the same table after edits and concurrent work.

**Current friction:** Capacity checks and touch/keyboard controls already exist. Assignment records and RSVP labels are written separately; stale concurrent checks remain a risk pending database verification. [S8]

**Proposed solution:** Save table-ID assignments atomically on the server, validate capacity and party size there, and expose revision conflicts. Derive labels everywhere. Warn when RSVP changes invalidate seating and make guest links resolve the current assignment.

**User flow:** Assign party → server validates/saves → all views refresh → later party change raises an exception → resolve → current pass shows updated table.

**Value:** Prevents contradictory printed/online plans and silent over-capacity seating. Mobile can default to a compact assignment list.

**Effort:** Medium to High. **Priority:** P0 for consistency validation and confirmed defects; P1 for change-review UX.

### R13 — Make arrival work on a real phone

**Problem:** Staff need fast scanning, while guests may have no camera permission, code or connection.

**Current friction:** Local global policy disables camera use despite the scanner requiring it; lookup UI repeats a QR before input. Manual search and check-in undo already exist. [S10]

**Proposed solution:** Allow camera only where required; retain manual search/code entry and undo. Put lookup first on guest phones. Provide large actions, persistent wedding name/date and a visible staffed-help fallback. Validate real camera permission denial and network failure.

**User flow:** Guest opens pass or venue QR → sees seat/enters code → staff scans or searches → confirmation distinguishes successful, repeated and failed check-in.

**Value:** Shorter arrival queues and lower coordinator stress.

**Effort:** Low to Medium. **Priority:** P0 for the camera policy and fallback rehearsal; P2 for presentation cleanup.

### R14 — Prepare an explicit wedding-day fallback

**Problem:** Venue internet failure must not prevent staff from seating guests.

**Current friction:** A printable report already exists; check-in depends on API calls and the generic offline page asks users to reconnect. This is not demonstrated offline operational support. [S9, S10]

**Proposed solution:** First, a dated downloadable roster/seating/emergency-contact handover with freshness and privacy controls. Warn before the event if it is missing. Later, add offline check-in with queued writes, visible unsynced count and deterministic reconciliation. Do not cache sensitive guest data indiscriminately.

**User flow:** Coordinator verifies/downloads handover → staff rehearse loss of internet → use roster/manual marks → reconcile when online.

**Value:** A wedding can continue during failure; concrete coordinator preference driver.

**Effort:** Low for fallback; High for offline writes. **Priority:** P0 fallback; P1 offline writes after pilot evidence.

### R15 — Create a coordinator home across ten weddings

**Problem:** A coordinator must know which client needs action without opening ten dashboards.

**Current friction:** Owned/shared wedding cards exist, but inspected dashboard orders weddings by creation and lacks a portfolio exception queue. Account types are couple/supplier. [S1, S9]

**Proposed solution:** A professional onboarding intent and cross-wedding “Needs attention” view. Include owned and accepted shared weddings, sorted by deadline/risk: unpaid amounts requiring confirmation, RSVP cutoff, unseated parties, supplier acknowledgments and failed sends.

**User flow:** Sign in → see urgent exceptions across clients → open one → resolve → return to queue; persistent wedding identity prevents cross-client mistakes.

**Value:** Saves repeated inspection and provides a credible recurring professional purchase reason.

**Effort:** Medium. **Priority:** P1.

### R16 — Reuse procedures and make task ownership actionable

**Problem:** Coordinators repeatedly recreate tasks and chase vaguely assigned responsibilities.

**Current friction:** Relative-date checklist seeds and free-text assignees already exist. Reusable coordinator playbooks, notification-linked ownership and date-change rebase review were not found in inspected planner flows. [S9]

**Proposed solution:** Save task/timeline playbooks with role placeholders and date offsets. Assign real collaborators or explicit external contacts. On date change, preview dependent shifts and preserve fixed dates. Never clone guest data, paid status or sent messages.

**User flow:** New wedding → choose playbook → map owners → review dates → assign → acknowledge → overdue exceptions appear in portfolio.

**Value:** Less repetitive setup, fewer forgotten tasks, stronger coordinator retention. Mobile shows today's actions rather than the entire checklist.

**Effort:** Medium. **Priority:** P1.

### R17 — Replace inferred balances with recorded payments

**Problem:** Couples and coordinators need accurate cash obligations and settlement instructions.

**Current friction:** Report assumes pending means half paid; planner commitment calculation mixes estimates and paid vendors. [S7]

**Proposed solution:** Immediately display unknown payments as unknown. Then link vendor/budget representations to one expense with estimated amount, contracted amount, actual payments and due dates. Derive outstanding once; do not turn a status into a monetary fact.

**User flow:** Estimate expense → record contract → record deposit/payment → calculate outstanding → show due/unknown amounts in handover → mark actual settlement.

**Value:** Trustworthy budgets and fewer vendor disputes. A payment entry should update every relevant view without duplicate typing.

**Effort:** Low for removing invented amounts; Medium for unified ledger. **Priority:** P0.

### R18 — Add a minimal vendor handoff and acknowledgment

**Problem:** A saved supplier contact does not establish whether the supplier knows the latest plan.

**Current friction:** Contact, amount, status and notes exist; structured arrival/deliverable acknowledgment was not found. [S9]

**Proposed solution:** A brief containing arrival location/time, onsite contact, deliverables, dependencies and recorded payment details. Give each supplier access only to their brief; track version and acknowledgment.

**User flow:** Coordinator prepares brief → authorizes send → supplier acknowledges → change creates a new version → only changed/unacknowledged items return to attention queue.

**Value:** Eliminates repeated calls and obsolete screenshots; mobile acknowledgment requires no full planning account.

**Effort:** Medium. **Priority:** P1.

### R19 — Remove repeated work from guest photo sharing

**Problem:** Guests want to share several photos while enjoying the celebration.

**Current friction:** Inspected upload takes the first selected file, requires a code, and explains code location after selection. Code prefill exists but seat-to-photo navigation does not preserve it. [S11]

**Proposed solution:** Preserve validated photo access context, support a compressed multi-file queue, retry only failures and show upload progress. Explain moderation/reveal before upload and distinguish “received” from “visible.” Keep existing moderation and reveal features.

**User flow:** Tap Photos from guest hub → choose several images → see progress → leave completed uploads intact after interruption → return to album when available.

**Value:** More memories with less guest effort, fewer support questions and a natural referral moment.

**Effort:** Medium. **Priority:** P1 for context/recovery; P2 for batch convenience.

### R20 — Give helpers only the access they need

**Problem:** A door assistant needs check-in, not budgets or private guest notes.

**Current friction:** Inspected collaborator roles are partner/coordinator; broad sharing does not match event-day delegation. [S9]

**Proposed solution:** Add scoped helper access for check-in, assigned tasks or relevant vendor briefs, with expiry/revocation and change history. Clarify ownership, billing and what remains accessible when a coordinator leaves.

**User flow:** Invite helper → select tasks/access window → preview permissions → helper signs in → perform authorized actions → access expires after handover.

**Value:** Coordinators can use assistants confidently without sharing owner credentials.

**Effort:** Medium. **Priority:** P1; access-isolation tests are P0 for every existing role.

### R21 — Automate thank-you preparation, preserve human review

**Problem:** Couples forget follow-up or repeat recipient work after the wedding.

**Current friction:** Thank-you builder, previews, tests and sending logs already exist. Creating relevant messages still needs deliberate host input. [S12]

**Proposed solution:** Build a suggested unsent-recipient queue using known guest context, with optional host-entered personal notes. Never infer gifts or attendance from an invitation alone. Reuse delivery/retry infrastructure and existing duplicate protection.

**User flow:** Wedding completes → couple receives one closeout prompt → reviews recipient/message previews → authorizes sending → sees accepted/delivered/failed separately.

**Value:** Less post-wedding administration without impersonal or incorrect messages; supports album return visits.

**Effort:** Medium. **Priority:** P1.

### R22 — Clarify what a payment unlocks

**Problem:** Buyers need to distinguish one wedding from professional account coverage.

**Current friction:** Checkout uses the same configured price for Account Pro and Planner Pro, with different entitlement scope. Public pricing advertises $15 one-time Planner Pro and unlimited guest emails. [S14; live pricing]

**Proposed solution:** One clear couple purchase for one wedding, plus a separately defined coordinator offer for portfolio value. State shared-wedding coverage, archive behavior, email units and service duration. Existing purchase promises should be honored; do not silently narrow them.

**User flow:** Upgrade at a relevant task → see named wedding/account coverage and limits → pay → return to that task with verified access.

**Value:** Fewer purchase mistakes, stronger conversion confidence and more sustainable professional revenue.

**Effort:** Medium. **Priority:** P1; factual offer consistency is a P0 paid-launch gate.

### R23 — Make payment status truthful and recoverable

**Problem:** A buyer cannot tell whether payment is still processing or access failed.

**Current friction:** Success page polls entitlement briefly but uses payment-success language when verification remains false. [S14]

**Proposed solution:** Distinguish processing, verified paid, failed and needs support. Verify the authenticated purchase and entitlement server-side. Provide safe retry/status recovery without duplicate purchase.

**User flow:** Return from checkout → processing → verified unlock → original task; if delayed, show status/recovery instead of claiming success.

**Value:** Less billing anxiety and support; conversion reflects real entitlement activation.

**Effort:** Medium. **Priority:** P0 for paid launch.

### R24 — Finish the wedding deliberately

**Problem:** Couples need memories and closure; coordinators need to hand off one client while nine remain active.

**Current friction:** Thank-you mode and albums exist, but a complete closeout flow was not found. Automatic date-only switching could be wrong for postponed or multi-day weddings. [S2, S12]

**Proposed solution:** A host-approved memories transition: review remaining balances, failed messages, photos and access; export; explain hosting/storage duration; archive the active workspace while preserving agreed guest links.

**User flow:** Confirm wedding complete → resolve essential exceptions → share approved album → export/handoff → expire helper access → archive.

**Value:** Positive ending, reduced coordinator clutter, guest album return visits and timely referrals.

**Effort:** Medium. **Priority:** P2; lifecycle/service-duration disclosure is P1.

### R25 — Measure completed jobs and ask for referrals after value

**Problem:** The team needs to know whether complexity is falling, not merely whether features are clicked.

**Current friction:** Existing wedding analytics count visits/QR scans and estimate reminder response from responses after the last send; that is not causal attribution. No complete activation funnel was found in inspected auth/builder paths. [S15]

**Proposed solution:** Instrument successful draft, publication, invitation, reconciled RSVP, resolved exceptions and verified paid unlock. Measure errors and elapsed time. Offer an optional referral after a successful album handoff or coordinator closeout, never during RSVP/seat finding.

**User flow:** User completes job → event records outcome without unnecessary guest data → team evaluates funnel → satisfied host sees optional share/invite prompt.

**Value:** Evidence-led simplification, better conversion decisions and respectful referrals.

**Effort:** Medium. **Priority:** P1 measurement; P3 referral experiment.

## 4. Launch blockers

Do not make every improvement a launch blocker. The following gates protect the workflows actually offered. A blocker can be resolved by fixing it or explicitly withholding the affected workflow and claim.

| Gate | Required proof before release |
|---|---|
| Imported guest can RSVP | Import pending household, reply through invitation, retry submission, edit response and handle two same-name guests without duplicates or rejection. R04–R05 |
| Financial reports tell the truth | Unknown deposit remains unknown; recorded payments reconcile; one expense appears once across planner and report. R17 |
| Drafts remain private and savable | Save incomplete draft, restore it after interruption, and verify public website/RSVP/photo/guest-book access respects publication. R02 |
| Supported QR operation works | Test camera-enabled deployed route on iPhone/Android, permission denial, repeated scan and manual fallback. Local policy conflict must be resolved. R13 |
| Seating remains consistent | Concurrent and interrupted writes do not leave contradictory tables; guest pass, export and staff view agree. Database enforcement is currently unverified. R12 |
| Automation claims are true | Verify actual scheduler; simulate missed run and failed provider request; no failed send marked successful; no duplicate retry. R09 |
| Time is correct | Guest in a different timezone receives the correct calendar instant; deadline and reminders use event timezone. R05, R10 |
| Paid experience is honest | Successful/delayed/failed checkout and replayed webhook produce correct status and scope. R22–R23 |
| Access and fallback are demonstrated | Existing roles cannot access another wedding; revoked access stops working; dated emergency roster is usable without internet. This is a validation requirement, not an allegation of a proven breach. R14, R20 |
| External embed, only if promised | Real external site accepts widget, mobile completion reaches same guest list, blocked iframe has fallback. Otherwise label unsupported. R06 |

These gates require controlled test weddings and production-like configuration. Source review alone cannot sign them off.

## 5. Coordinator-specific opportunities: ten-wedding simulation

**Scenario assumptions:** One lead coordinator, two assistants and ten concurrent client weddings. Two are in event week, three are nearing RSVP cutoff, three are being planned and two are closing out. Assume 150 invited people per wedding for scenario scale, not a claim about QuickWeds customers.

| Moment | Repetitive work/risk today | How QuickWeds should eliminate it |
|---|---|---|
| Monday morning | Open ten wedding cards and inspect multiple tool areas to find problems. | Portfolio queue shows only due, failed, conflicting or unacknowledged work. R15 |
| Start another client | Recreate coordinator process and contacts/roles. | Apply clean playbook with offsets and role placeholders, never previous guest/payment data. R16 |
| Three RSVP deadlines approach | Check pending lists, send reminders, then check whether they worked. | Approved schedules recheck response status; failed/unreachable recipients appear as exceptions. R09 |
| Client submits guest spreadsheet | Map columns, reconcile names, correct imported/reply duplicates. | Saved mapping, dry run, invitation identity and ambiguity review. R04, R11 |
| Guest changes from two people to three | Manually cross-check catering and table capacity. | RSVP change flags affected seating/catering totals before release. R05, R12 |
| Couple moves wedding date | Recalculate deadlines, inform suppliers and amend calendar. | Preview dependent changes; approved updates create tracked acknowledgments. R10, R16, R18 |
| Final payment review | Infer deposits from statuses or cross-check chat screenshots. | Recorded payments and unknown amounts are explicit in one ledger. R17 |
| Assign assistant to reception | Grant broad access or relay screenshots. | Scoped check-in role with clear wedding identity and expiry. R20 |
| Two staff check guests in | Refresh counters and resolve conflicting updates. | Freshness/version indicators, repeat-scan handling, canonical records. R12–R14 |
| Venue connection fails | Rely on whatever screenshots or cached pages happen to exist. | Verified downloaded handover and practiced fallback; offline writes later. R14 |
| Supplier is late | Search notes for contact and latest arrival agreement. | One-tap contact plus latest acknowledged brief. R18 |
| One wedding finishes | Remember thank-yous, album, final balances, access removal and archive. | Closeout queue and intentional handoff. R21, R24 |

**Illustrative workload arithmetic:** Ten weddings × six categories checked × one minute per category = 60 minutes per daily inspection. If an exception queue reduced the work to twelve actionable items at two minutes each, inspection would take 24 minutes: a hypothetical 36-minute saving. This is a testable assumption, not measured ROI; implementation could save less or more.

The strongest coordinator proposition is: **“QuickWeds tells me which wedding needs me, and gives my team a plan we can trust.”** Multi-wedding cards alone do not deliver that proposition.

Pilot with coordinators handling multiple real weddings and observe: opening the day, importing a list, changing a response, handing over to an assistant, settling a vendor and closing a wedding. Measure context switches, correction work and time per resolved exception.

## 6. Guest-experience opportunities

| Guest stage | Simplest useful experience | Failure/edge case that must remain understandable |
|---|---|---|
| Invitation | Recognizable couple names, date, who is invited and one primary action. | Wrong recipient or forwarded link has a safe contact path. R04, R08 |
| Website | Immediate RSVP, date/time, location and contact; optional story below practical details. | Slow mobile connection still exposes essential text. R03, R07 |
| RSVP | Prefilled invited members and only relevant questions. | Decline, partial household attendance, no email and same-name people. R04–R05 |
| Confirmation | Exact attendance summary and edit link; save guest pass/calendar. | Email failure does not erase a successful RSVP or falsely claim delivery. R07, R09 |
| Reminders | Only timely, relevant reminders with the same personal link. | Guest has already replied, event changed or delivery failed. R09–R10 |
| Arrival | Venue-local arrival time, directions and current contact. | Wrong entrance, no connection or device in another timezone. R07, R10, R14 |
| QR interaction | Clear invitation/seat/staff purpose. | No camera, lost code, old printed QR or scan repeated. R08, R13 |
| Seat finding | Current table shown immediately from personal link. | Unassigned/changed table says “Please see reception” rather than displaying an old guess. R12–R13 |
| Photo sharing | Photo action preserves access; multi-upload with progress. | Interrupted upload, code absent, moderation pending or reveal in future. R19 |
| Post-wedding | Approved album and thoughtful thanks; optional sharing. | Album not ready or retention period ending is communicated clearly. R21, R24–R25 |

**Mobile priority:** Keep the next guest action visible, make lookup/form controls easy to tap, preserve entered responses, avoid repeated codes, and make success/error copy specific. Existing responsive styling, compression and touch seating are strengths to preserve. Test practical tasks on small phones, low bandwidth, large text and keyboard/screen-reader navigation before describing the complete journey as verified mobile-friendly.

What makes guests remember QuickWeds is a successful RSVP in one sitting, knowing where to go, finding their table without waiting, and getting the memories afterward. A logo interrupting those actions would weaken the experience.

## 7. Automation opportunities

Use one shared automation mechanism with per-wedding rules, responsible owner, timezone, next run, outcome and audit history. Do not create a different scheduler for each feature.

| Manual thing people must remember | Trigger → automated action | Human decision and failure handling | Card |
|---|---|---|---|
| Save planning work | Meaningful edit → persist draft | Show unsaved/error; never imply save succeeded | R02 |
| Chase missing replies | Approved offsets before cutoff → remind still-pending recipients | Host approves schedule; suppress after reply/cancellation; failures to queue | R09 |
| Reconcile new answers | RSVP updated → recalculate people/event counts | Flag identity conflicts, never merge by name | R04–R05 |
| Recheck seating | Party size/attendance changes → detect invalid/unassigned seating | Coordinator chooses new table; notify only appropriate affected guests | R12 |
| Recalculate deadlines | Wedding date changes → preview dependent dates | Coordinator accepts changes, fixed contractual dates stay explicit | R10, R16 |
| Chase task owners | Due/overdue state → notify assigned identity | Escalate unresolved items; avoid repeated alerts after completion | R16 |
| Follow up suppliers | Brief sent/changed → request acknowledgment | Approval before outbound send; queue overdue acknowledgments | R18 |
| Check vendor balances | Payment recorded → recalculate outstanding and upcoming due | Unknown stays unknown; no auto-payment | R17 |
| Prepare event fallback | Event approaching → check/download handover readiness | Named owner verifies freshness and rehearsal | R14 |
| Follow up on memories | Host confirms completion → prepare album/thanks queue | Human reviews recipients and content before sending | R19, R21 |
| Remove helper access | Approved access end → expire role | Owner can extend; preserve appropriate audit history | R20, R24 |

Automation rules must account for pauses, postponed weddings, duplicate execution, missing contact details, provider rejection, quotas and changed recipient status. A user should be able to answer: **What will happen next, to whom, and what happened last time?**

## 8. Monetization opportunities

The [public pricing page](https://www.quickweds.site/) currently presents free publishing and a $15 one-time Planner Pro upgrade, including unlimited guest emails and deeper planning tools. Local checkout also has Account Pro at the same configured price. These are observed offers, not a validated pricing recommendation.

**Clarify existing scope before raising prices.** An account-wide owner entitlement and a per-wedding entitlement should not require users to understand implementation. A coordinator working on couple-owned shared weddings needs explicit coverage; do not assume their personal Account Pro automatically upgrades clients' weddings.

| Opportunity | Why someone would pay | Suggested experiment, not a committed price | Card |
|---|---|---|---|
| Couple wedding upgrade | Finalize seating, plan and communication with less admin. | Keep one clear wedding purchase; test upgrade timing after first valid RSVP or meaningful planning progress. | R22 |
| Coordinator professional offer | Portfolio exception queue, reusable procedures, assistant access and handover. | Pilot subscription or active-wedding bundle; compare willingness to pay with measured time saved. | R15–R16, R20, R22 |
| Assisted setup | Import cleanup and a verified first invitation for time-poor couples/coordinators. | Deliver manually to a small cohort before building automation; measure support cost and completion. | R03–R04, R11, R22 |
| Optional extended memories hosting | A couple explicitly wants longer hosted albums after included service. | Test only with a clearly disclosed included duration and easy export. Never hold existing memories hostage. | R24 |
| Referral | Satisfied hosts introduce another couple; coordinators bring subsequent clients. | Ask after a useful milestone, track referred activation rather than shares alone. | R25 |

Do not charge guests to RSVP, find seats or upload ordinary wedding photos. Do not place emergency data access, correction of incorrect balances or basic confirmation reliability behind an additional purchase. Show the actual unit of the free email allowance: outbound recipient sends are different from stored email addresses, and automatic confirmations are described as excluded.

Before expanding an unlimited one-time offer, measure email/storage/hosting/support costs per wedding and per professional account. No specific margin or optimal price can be justified from the inspected source. Treat professional pricing as a discovery experiment, preserving existing purchase commitments.

## 9. Features that should NOT be built now

| Feature to defer | Why it does not solve the current constraint | Smaller response |
|---|---|---|
| More elaborate template/animation variants | Existing breadth already precedes activation; additional choice adds setup decisions. | Better defaults and essential setup path. |
| Autonomous AI seating | Social constraints and incomplete household data make errors costly. | Reliable assignments, explicit constraints and human-reviewed suggestions later. |
| General-purpose internal chat | Creates another place to search and an expectation of real-time support. | Task ownership, acknowledgments and concise change history. |
| Full vendor CRM/procurement/bidding marketplace | Requires supply, quality control and a second business model. | Saved contacts plus versioned operational briefs. |
| Accounting, payroll or automatic vendor payments | Far beyond the need for accurate deposits and balances. | A small factual expense/payment ledger. |
| Guest social network or mandatory app | Guests want to attend one event with little commitment. | No-account guest hub and optional memory sharing. |
| AI relationship-aware thank-you writing without review | Unknown gifts/attendance can create offensive mistakes. | Drafts using confirmed data and human personalization. |
| More honeymoon/food mini-apps | Existing planner already spans peripheral categories. | Keep simple linked notes and focus on attendance/day-of correctness. |
| Facial recognition or guest tracking | Adds sensitivity and complexity without solving upload friction. | Simple album moderation and sharing access. |
| Complex automated lifecycle decisions | Date alone does not prove a wedding happened. | Approved rules and explicit completion confirmation. |

These are prioritization decisions, not claims that such features can never have value. Revisit only after observing a concrete repeated job that current simpler tools cannot satisfy. Experimental AI seating suggestions or automated creative assistance would be P4 and are outside this roadmap.

## 10. Recommended 30/60/90-day roadmap

This is a sequenced scope proposal. Team size, data migration complexity and release capacity were not provided; do not promise every item within 90 calendar days. If capacity is limited, cut later scope rather than weaken correctness gates.

| Period | Product outcome | Committed focus | Exit evidence |
|---|---|---|---|
| Days 1–30 | Core invitation and operational facts become trustworthy | R04 imported guest response fix; R05 validation/decline; R17 remove invented balances and define expense truth; R02 private saving; R13 camera/fallback; R09 false-success fix and scheduler audit; R10 timezone correctness; R23 truthful payment state. Validate R12 concurrency and existing access isolation. | Controlled lifecycle rehearsal passes: import → invite → reply → assign → scan/search → print → photo → thanks. Failed sends remain failed; private drafts remain private; reported balances reconcile. |
| Days 31–60 | Couples activate faster; coordinators manage by exceptions | R01/R03 shortened setup; R04 full identity/edit flow; R11 import/count clarity; R15 portfolio queue; R16 owners/playbook minimum; R09 durable approved reminders; R12 authoritative assignment if not completed; R14 dated handover; R25 measurement. | Pilot coordinators can find and resolve urgent items across ten test weddings without opening each tool. Observe real tasks; establish baseline and compare time/errors. |
| Days 61–90 | Complete guest continuity and validate professional value | R07 continuing guest hub; R18 vendor briefs; R19 photo context/batch recovery; R20 scoped helpers; R21/R24 closeout; R22 professional offer pilot. R06 external embed only if demand/commitment warrants. | Guests complete RSVP/edit/seat/photo tasks on phones; suppliers acknowledge briefs; closeout produces correct export/access state; professional buyers understand scope and show repeat use. |

**Explicitly outside the default 90-day scope:** full offline write synchronization, autonomous seating, broad vendor marketplace expansion and a guest app. An offline roster is required; offline editing is a separate engineering investment.

**Suggested pilot targets—not current measurements:** median essential draft setup under five minutes; representative simple RSVP under 90 seconds; personal-link seat lookup under 15 seconds on a healthy connection; zero lost/duplicate records in failure/concurrency rehearsal; every failed automated send visible to an owner. Validate targets with actual users before turning them into public promises.

### Measurement plan

| Outcome | Metric and denominator |
|---|---|
| Couple activation | New eligible couple accounts reaching a published wedding plus first reconciled non-test RSVP; also measure time and funnel drop-off. |
| Guest RSVP completion | Successful submissions divided by valid invitation-linked RSVP starts; segment household complexity, device, open vs private link and embed. |
| Coordinator value | Time to identify/resolve portfolio exceptions, manual corrections per wedding, and next-client reuse. |
| Communication reliability | Accepted, delivered where provider reports it, bounced, failed and retried sends per eligible recipient—not a single “sent” count. |
| Day-of reliability | Successful seat lookups/check-ins, repeats, unresolved assignments and fallback usage; distinguish unique people from scans. |
| Paid conversion | Verified paid entitlement among eligible activated weddings/accounts; separate couple and coordinator scopes. |
| Post-wedding success | Completed export/album handoff and unresolved closeout items; coordinator next-wedding use; referred accounts that activate. |

Existing reminder-response analytics count subsequent RSVPs after the last reminder; they do not prove the reminder caused those responses. Use recipient-linked events for operational attribution and controlled comparisons where causal lift matters.

### Evidence register

Sources were inspected on 6 September 2026. Local sources are working-tree code; version parity with production is not established. Links point to representative verified locations; broader files were also searched/read.

- **S1 — Auth and onboarding:** [account routing](C:/Users/romie/quickweds/src/lib/account.ts:1), [returning login destination](C:/Users/romie/quickweds/src/lib/account.ts:71), [goal state](C:/Users/romie/quickweds/src/app/onboarding/account-type/page.tsx:103), [final destinations](C:/Users/romie/quickweds/src/app/onboarding/account-type/page.tsx:420), [signup](C:/Users/romie/quickweds/src/app/signup/page.tsx:65). Confirms role set, goal routing and sessionless redirect; auth provider configuration unverified.
- **S2 — Builder and readiness:** [steps](C:/Users/romie/quickweds/src/components/BuilderForm.tsx:233), [default publication](C:/Users/romie/quickweds/src/components/BuilderForm.tsx:394), [save checks](C:/Users/romie/quickweds/src/components/BuilderForm.tsx:1150), [readiness definitions](C:/Users/romie/quickweds/src/lib/wedding-health.ts:1). Confirms draft/publication coupling and optional-check mixture.
- **S3 — RSVP and import:** [duplicate rejection](C:/Users/romie/quickweds/src/app/api/public/rsvp/route.ts:90), [submission implementation](C:/Users/romie/quickweds/src/components/RSVPForm.tsx), [validation](C:/Users/romie/quickweds/src/lib/validations.ts), [CSV import](C:/Users/romie/quickweds/src/components/dashboard/GuestImportModal.tsx:89). Confirms insert/rejection behavior; production schema constraints not inspected.
- **S4 — Embed configuration:** [global headers](C:/Users/romie/quickweds/next.config.ts:20), [internal RSVP section](C:/Users/romie/quickweds/src/components/wedding/RSVPSection.tsx). Search found no external widget contract; absence limited to inspected repository.
- **S5 — Guest pass:** [email pass/QR rendering](C:/Users/romie/quickweds/src/emails/quickweds-transactional.tsx:258), [personal pass](C:/Users/romie/quickweds/src/app/seat/[token]/page.tsx), [seat finder](C:/Users/romie/quickweds/src/app/w/[id]/seat-finder/page.tsx). Existing guest identity assets should be reused.
- **S6 — Communication:** [guest reminder cron](C:/Users/romie/quickweds/src/pages/api/cron/reminders.ts:38), [failed-result handling gap](C:/Users/romie/quickweds/src/pages/api/cron/reminders.ts:93), [email result](C:/Users/romie/quickweds/src/lib/email.ts:80), [configured schedule](C:/Users/romie/quickweds/vercel.json:1), [manual reminders](C:/Users/romie/quickweds/src/app/api/weddings/reminders/route.ts), [planner reminders](C:/Users/romie/quickweds/src/app/api/planner/event-reminders/route.ts). External invocation/delivery logs unverified.
- **S7 — Budget:** [inferred 50% deposit](C:/Users/romie/quickweds/src/app/dashboard/[id]/wedding-day/coordinator-report/page.tsx:293), [commitment calculation](C:/Users/romie/quickweds/src/app/dashboard/[id]/planner/page.tsx:1664). Confirmed calculations; actual duplicate expense occurrence not measured.
- **S8 — Seating:** [capacity checks](C:/Users/romie/quickweds/src/components/dashboard/SeatingChartBuilder.tsx:723), [separate writes](C:/Users/romie/quickweds/src/components/dashboard/SeatingChartBuilder.tsx:732). Confirms non-atomic client sequence; server/database protection requires integration validation.
- **S9 — Coordinator tools:** [shared weddings](C:/Users/romie/quickweds/src/app/dashboard/page.tsx:459), [ordering](C:/Users/romie/quickweds/src/app/dashboard/page.tsx:485), [task seed](C:/Users/romie/quickweds/src/app/dashboard/[id]/planner/page.tsx:996), [assignee](C:/Users/romie/quickweds/src/app/dashboard/[id]/planner/page.tsx:1194), [vendor fields](C:/Users/romie/quickweds/src/app/dashboard/[id]/planner/page.tsx:2307), [collaborator roles](C:/Users/romie/quickweds/src/lib/wedding-features.ts:5). Existing capabilities and bounded workflow gaps.
- **S10 — Day-of/device:** [camera policy](C:/Users/romie/quickweds/next.config.ts:26), [camera request](C:/Users/romie/quickweds/src/components/dashboard/GuestQrScanner.tsx:24), [offline page](C:/Users/romie/quickweds/src/app/offline/page.tsx), [check-in](C:/Users/romie/quickweds/src/app/dashboard/[id]/planner/check-in/page.tsx:61). Local configuration conflict; no production device rehearsal performed.
- **S11 — Photos:** [single-file selection](C:/Users/romie/quickweds/src/app/w/[id]/photos/page.tsx:207), [code requirement](C:/Users/romie/quickweds/src/app/w/[id]/photos/page.tsx:298), [seat-to-photo link](C:/Users/romie/quickweds/src/app/w/[id]/seat-finder/page.tsx:167). Compression/moderation/reveal already implemented.
- **S12 — Thank-you:** [manager](C:/Users/romie/quickweds/src/components/dashboard/ThankYouNoteManager.tsx), [server workflow](C:/Users/romie/quickweds/src/lib/thank-you-server.ts), [send route](C:/Users/romie/quickweds/src/app/api/weddings/thank-you/send/route.ts). Existing review/logging flows; no customer closeout observation.
- **S13 — Calendar:** [local-time construction](C:/Users/romie/quickweds/src/components/wedding/SmartCalendar.tsx:27). Confirms viewer-local parsing before UTC export.
- **S14 — Pricing/payment:** [shared configured checkout price and scope](C:/Users/romie/quickweds/src/app/api/stripe/checkout/route.ts:64), [Pro access](C:/Users/romie/quickweds/src/lib/planner-limits.ts:64), [free allowance](C:/Users/romie/quickweds/src/lib/planner-limits.ts:1), [success state](C:/Users/romie/quickweds/src/app/payment/success/page.tsx:81), [webhook](C:/Users/romie/quickweds/src/app/api/stripe/webhook/route.ts), [live public pricing](https://www.quickweds.site/). Actual configured checkout price not queried; $15 is public offer and code default.
- **S15 — Measurement:** [analytics summary](C:/Users/romie/quickweds/src/lib/wedding-features.ts:296). Existing session-based visitor and temporal reminder-response estimates; full production instrumentation unverified.

**Research stopping point:** Every requested lifecycle stage has source coverage or an explicit gap; highest-impact findings were spot-checked against source. Further repository searching is less valuable than authenticated lifecycle rehearsal, deployment/scheduler checks, real mobile observation and coordinator interviews. No competitor feature checklist was used to justify the recommendations.
