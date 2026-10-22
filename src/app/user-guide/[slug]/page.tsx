import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  Building2,
  Gift,
  Heart,
  History,
  LayoutDashboard,
  MailCheck,
  Palette,
  PartyPopper,
  Plane,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Utensils,
  Wallet,
  WandSparkles,
  UserCheck,
  UsersRound,
} from 'lucide-react';

const guides = {
  'wedding-website-builder': {
    title: 'Wedding Website Builder Guide',
    description: 'Create, design, preview, publish, and edit your wedding website with draft autosave and monograms.',
    icon: Palette,
    overview: 'The builder creates your guest-facing wedding website. This is where you add couple details, venue information, love story, couple photos, multi-event timelines, RSVP rules, visual attire guides, FAQs, gift QR codes, and custom monograms.',
    steps: [
      'Open your Dashboard and click "Create New Wedding" or edit an existing wedding card.',
      'Enter your couple names, wedding date, ceremony time, venue name, and RSVP deadline.',
      'Select a designer template (Royal, Editorial, Vintage, Minimal, Luxury, Garden, etc.) and your motif accent color.',
      'Configure the Visual Attire Guide with color palette swatches and illustrated character models.',
      'Add story, couple photos, event timelines, gift details, FAQs, and custom monograms.',
      'Preview your website on desktop and mobile viewports, then click Publish or Save.',
      'Your work is continuously auto-saved as local and cloud drafts, so you can safely resume anytime.',
    ],
    automated: [
      'QuickWeds auto-saves drafts locally and in storage to prevent data loss on accidental browser closing.',
      'QuickWeds generates a fast, mobile-optimized public wedding website link.',
      'The selected theme, fonts, and motif colors apply cohesively across every section.',
      'Guest RSVP submissions automatically flow into your dashboard in real time.',
    ],
    tips: [
      'Complete the venue, timeline, attire, and FAQ sections before sharing widely with guests.',
      'Keep text clear and concise—over 70% of guests view wedding websites from mobile devices.',
      'Use the live preview drawer to test your layout before finalizing changes.',
    ],
  },
  'rsvp-guest-list': {
    title: 'Smart RSVP and Guest List Guide',
    description: 'Track replies, manage plus-ones, dietary requirements, and organize guest lists.',
    icon: UsersRound,
    overview: 'The RSVP and guest list tools help you track who is attending, who declined, meal choices, and who needs follow-up. Guests can RSVP through your website form or be added manually by couples and coordinators.',
    steps: [
      'Set an RSVP deadline and configure permissions for plus-ones and children.',
      'Share your wedding website link or print-ready RSVP QR code with guests.',
      'Guests open the site, find their invitation instantly via search, and submit responses.',
      'Open the dashboard or planner guest tools to review real-time responses and meal tallies.',
      'Add manual guests when friends or family members confirm via phone or message.',
      'Organize guests into groups (Family, Entourage, Friends, VIPs) and export lists to CSV/Excel.',
      'Confirmed attending guests automatically become available in the Seating Planner.',
    ],
    automated: [
      'Online RSVP submissions update instantly without needing page refreshes.',
      'RSVP deadline locks automatically freeze responses at the end of the cutoff date globally.',
      'Attending guests and party headcounts link seamlessly to the Seating Planner.',
      'Meal preferences and dietary restrictions are automatically grouped for catering handoff.',
    ],
    tips: [
      'Set your RSVP deadline 2 to 4 weeks before the wedding to give caterers accurate counts.',
      'Use the pending guest reminder button in Analytics to send follow-up emails before the cutoff.',
      'Manually add guests who confirm through family members so seating charts remain complete.',
    ],
  },
  'smart-rsvp-search': {
    title: 'Smart RSVP Instant Search & Deadline Locks Guide',
    description: 'Speed up guest responses with instant search autocomplete, plus-one controls, and automated deadline locks.',
    icon: Search,
    overview: 'QuickWeds Smart RSVP eliminates cumbersome password logins or lost links. Guests find their invitations in seconds by typing their name, while automated deadline locks ensure final guest lists are frozen in time for caterers and venue planners.',
    steps: [
      'In the website builder or planner, specify your RSVP deadline date.',
      'Turn on "Smart RSVP Search" so invited guests can find their invites via real-time typeahead.',
      'Set whether plus-ones and children are allowed globally or configured per individual guest.',
      'Guests visit your public wedding link, type their first or last name in the search bar, and select their invite.',
      'The form auto-fills their household members, meal preferences, dietary notes, and optional song requests.',
      'When the deadline passes, RSVPs automatically lock globally, displaying a clear notice that RSVPs have closed for the event.',
      'If a guest needs to change their status after the deadline, wedding owners can manually update it in the dashboard or Planner.',
    ],
    automated: [
      'Real-time autocomplete matches guest names instantly without exposing other guests’ private contact info.',
      'RSVP deadline lockout automatically activates globally at the end of the deadline day (UTC-12).',
      'Confirmed attendance numbers and dietary requirements instantly update dashboard analytics and seating charts.',
    ],
    tips: [
      'Set an RSVP deadline well in advance of your caterer’s final payment milestone.',
      'Send automated reminder emails to pending guests 7 days and 3 days before the cutoff date.',
      'If you have multiple guests with common names (e.g., "John Smith"), include middle initials or household tags.',
    ],
  },
  'attire-guide-dress-code': {
    title: 'Visual Attire Guide and Dress Code Guide',
    description: 'Help guests dress with confidence using illustrated character silhouettes, color palette swatches, and role-specific attire cards.',
    icon: Shirt,
    overview: 'The Visual Attire Guide eliminates confusion about wedding dress codes. Instead of vague notes, QuickWeds lets you enter attire guidelines, curate color palette swatches, and display illustrated character models for guests, principal sponsors, and bridesmaids.',
    steps: [
      'Open the website builder and navigate to the Attire & Dress Code section.',
      'Enter attire guidelines (e.g., Formal, Black Tie, Semi-Formal, Cocktail, Casual).',
      'Pick theme color palette swatches to visually indicate acceptable dress and suit colors.',
      'Configure role-specific attire cards for General Guests, Principal Sponsors, and Bridesmaids.',
      'Add footwear or comfort recommendations (e.g., "Block heels recommended for lawn ceremony; ballroom is air-conditioned").',
      'Preview the attire section on mobile and desktop viewports, then save and publish your site.',
    ],
    automated: [
      'Illustrated character silhouettes for Guests, Sponsors, and Bridesmaids dynamically reflect your chosen dress and suit colors.',
      'Interactive color swatches display hex values and mood swatches on the live wedding website.',
      'Attire cards integrate seamlessly with all QuickWeds designer templates.',
    ],
    tips: [
      'Clearly state any colors that are strictly reserved (e.g., white, ivory, or specific bridal party shades).',
      'Include weather or venue context (outdoor breezes, grass lawns, cobblestones) to help guests choose appropriate shoes and fabrics.',
      'Direct guests to the Attire section on your site link when they ask what to wear.',
    ],
  },
  'post-wedding-memories': {
    title: 'Post-Wedding Memories & Photo Recap Guide',
    description: 'Turn your wedding site into a post-wedding celebration recap with Polaroid or Grid galleries, guestbook notes, and high-res downloads.',
    icon: History,
    overview: 'Post-Wedding Mode transforms your live wedding site into a celebration memory hub once your big day has passed. You can display guest photo uploads, showcase heartfelt digital guestbook wishes on the Wall of Love, link your photographer’s full album, and send personalized thank-you emails to attending guests.',
    steps: [
      'Open your wedding dashboard and click "Post-Wedding Mode" on your wedding card.',
      'Toggle "Thank You Mode" on to switch your public website from pre-wedding RSVP to post-wedding celebration recap.',
      'Select your photo recap layout: choose "Polaroid" for nostalgic overlapping snapshots or "Grid" for a clean modern masonry layout.',
      'Add your official photographer album link (Google Drive, Dropbox, Pixieset, etc.) so guests can download official high-res photos.',
      'Moderate guest uploads in the Photo Portal, approving the best memories to feature publicly on the site.',
      'Write a warm couple message (or choose from our heartfelt presets) and send thank-you emails with gallery links directly to attended guests.',
    ],
    automated: [
      'The public website immediately switches headers and nav items to celebration recap mode.',
      'Approved guest photos and guestbook messages display dynamically in real time.',
      'Photo lightbox allows visitors to zoom, view captions, and download photos with 1 click.',
      'Live counters track total approved photos, pending moderation items, and guestbook messages.',
    ],
    tips: [
      'Display the photo upload QR code on tables or by the dance floor during the reception to capture candid moments.',
      'Review and approve guest uploads before sharing the post-wedding recap link with extended family.',
      'Include your official photographer album link so guests do not have to ask you individually for high-res files.',
    ],
  },
  'planner-workspace': {
    title: 'Planner Workspace Guide',
    description: 'Understand Planner tabs and how each wedding has its own dedicated planner.',
    icon: LayoutDashboard,
    overview: 'Every wedding website has its own isolated planner workspace. This keeps budget, suppliers, seating, checklist, calendar, food, photos, honeymoon, and thank-you planning organized separately for each wedding.',
    steps: [
      'Open the Dashboard and select the wedding you want to manage.',
      'Click the wedding card’s "Planner" button.',
      'Use each specialized Planner tab for a specific planning area (Budget, Vendors, Seating, Checklist, etc.).',
      'Keep supplier quotes, payment balances, and checklist milestones updated as plans evolve.',
      'Switch between owned weddings easily from the top dashboard selector.',
    ],
    automated: [
      'Planner data is strictly scoped to the active wedding.',
      'Account Pro unlocks Planner access across all owned weddings.',
      'Legacy wedding-level premium access is preserved automatically.',
    ],
    tips: [
      'Always open Planner from the correct wedding card if you coordinate multiple events.',
      'Collaborators will only have access to weddings they were explicitly invited to.',
    ],
  },
  'checklist-calendar': {
    title: 'Checklist and Calendar Guide',
    description: 'Use the wedding checklist, 12-month plan, schedules, reminders, and Google Calendar connection.',
    icon: ClipboardList,
    overview: 'Checklist and Calendar help you organize preparation tasks and wedding schedules. The checklist is best for tasks and deliverables, while the calendar manages appointments, fittings, and time-sensitive milestones.',
    steps: [
      'Open Planner and go to the Checklist tab.',
      'Add tasks under General, Entourage, Parents, Bride Attire, Groom Attire, or 12-Month Wedding Plan.',
      'Click "Load 12-Month Checklist" to prefill recommended milestones based on your wedding date.',
      'Mark items done with 1 tap as you complete them.',
      'Open the Calendar tab to schedule vendor tastings, dress fittings, rehearsals, and payment due dates.',
      'Connect Google Calendar to sync scheduled appointments directly with your personal calendar.',
    ],
    automated: [
      'The 12-month checklist calculator seeds milestones tailored to your wedding date.',
      'Calendar events trigger upcoming schedule reminders for couples.',
      'Google Calendar connection syncs scheduled planner events directly to your calendar.',
    ],
    tips: [
      'Use Checklist for tasks/to-dos and Calendar for date-and-time appointments.',
      'Load the 12-month checklist as a baseline, then customize it for your specific wedding timeline.',
    ],
  },
  'entourage-proposals': {
    title: 'Entourage Proposals Guide',
    description: 'Invite sponsors, wedding party, and helpers, then track proposal responses.',
    icon: UserCheck,
    overview: 'Entourage Proposals help couples invite principal sponsors, wedding party members, family helpers, and special roles with curated email templates and digital response tracking inside Planner.',
    steps: [
      'Open Planner and navigate to the Entourage tab.',
      'Add each person with their full name, email address, wedding role, and invitation template.',
      'Customize the proposal message to share personal memories and why their presence matters.',
      'Send digital proposal emails directly to the selected entourage members.',
      'Track accepted, declined, and pending responses in real time from the same tab.',
      'Follow up easily with anyone who has not responded before finalizing the program.',
    ],
    automated: [
      'QuickWeds formats proposal emails using your selected entourage template.',
      'Each entourage invitation includes a secure, 1-tap digital response link.',
      'Responses update the planner status immediately upon submission.',
    ],
    tips: [
      'Verify spelling, role titles, and email addresses before dispatching invitations.',
      'Use personalized role titles (e.g., "Ninong of Honor" or "Chief Bridesmaid") to make proposals extra special.',
    ],
  },
  'budget-planner': {
    title: 'Smart Budget & Expense Tracker Guide',
    description: 'Track wedding spending, multi-currency costs, payment milestones, and supplier balances.',
    icon: Wallet,
    overview: 'The Budget Planner helps couples track estimated and actual wedding costs, categorize spending, monitor payments and outstanding balances, and select from 10 supported currencies (PHP, USD, CAD, AUD, NZD, GBP, EUR, JPY, SGD, INR).',
    steps: [
      'Open Planner and navigate to the Budget tab.',
      'Set your overall target budget and select your preferred currency (PHP, USD, CAD, AUD, NZD, GBP, EUR, JPY, SGD, INR).',
      'Add budget items across categories: Venue, Catering, Photo & Video, Styling, Attire, HMUA, Entertainment, and Favors.',
      'Enter estimated costs, negotiated actual costs, and payment notes.',
      'Mark items as paid when transactions complete, and monitor your remaining budget buffer and outstanding commitments.',
      'Export your full budget breakdown as a CSV file anytime for spreadsheet analysis.',
    ],
    automated: [
      'Budget totals and category allocations recalculate automatically on every change.',
      'Food and Drinks custom costs can automatically flow into budget totals when no external caterer is linked.',
      'Linked suppliers keep deposit balances synchronized across the vendor and budget tools.',
    ],
    tips: [
      'Log deposits immediately after making vendor transfers so balances stay accurate.',
      'Keep custom menu expenses separate from all-inclusive venue packages to avoid double-counting.',
    ],
  },
  'suppliers-directory': {
    title: 'Suppliers and Directory Guide',
    description: 'Save suppliers, manage planner vendors, and use the business directory.',
    icon: Gift,
    overview: 'Supplier tools help couples track vendors they are considering or have booked. The directory helps users discover top wedding businesses and save them straight into their planner.',
    steps: [
      'Open the Suppliers tab in Planner to manage booked and shortlisted wedding vendors.',
      'Record supplier name, category, contact info, contracts, quoted amounts, and payment notes.',
      'Explore the public Supplier Directory to discover verified photographers, venues, caterers, and stylists.',
      'Save directory vendors directly into your planner with 1 click.',
      'Update payment milestones and coordinator contact info as your wedding approaches.',
    ],
    automated: [
      'Saved suppliers appear as selectable options in Budget and Food & Drinks tabs.',
      'Catering vendors automatically connect to menu courses and headcount pricing.',
      'Supplier records remain organized securely within your specific wedding planner.',
    ],
    tips: [
      'Use categories consistently (e.g., Photo, Video, HMUA, Venue, Catering, Styling, DJ).',
      'Keep vendor arrival times and phone numbers up to date for your wedding coordinator.',
    ],
  },
  'food-drinks-planner': {
    title: 'Food and Drinks Planner Guide',
    description: 'List menu ideas, upload food references, add suppliers, and track costs.',
    icon: Utensils,
    overview: 'Food and Drinks Planner organizes menu ideas, drink selections, cocktail hour bites, reference photos, catering sources, and estimated per-head or package costs.',
    steps: [
      'Open Planner and go to Food & Drinks.',
      'Add appetizers, main courses, desserts, late-night snacks, or signature cocktails.',
      'Upload food reference photos directly from your phone or laptop.',
      'Enter estimated costs, serving styles (buffet, plated, family style), and dietary tags.',
      'Link an existing catering supplier from your vendor list or enter a custom source.',
      'Review total meal expenses and sync them with your main wedding budget.',
    ],
    automated: [
      'Linked caterers prevent double-counting when package quotes already cover food costs.',
      'Custom catering items automatically roll up into the overall wedding budget calculation.',
      'Dietary requirements from RSVP guests can be referenced alongside menu choices.',
    ],
    tips: [
      'Use reference photos during catering tastings and menu finalization meetings.',
      'Make sure signature cocktail ingredient lists are noted for bar supply purchasing.',
    ],
  },
  'photo-sharing': {
    title: 'Guest Photo Sharing Guide',
    description: 'Collect candid guest photos with sharing codes, moderation queues, and bulk ZIP export.',
    icon: Camera,
    overview: 'Photo Sharing provides a private digital camera space for guests to upload candid memories during and after the wedding. Includes sharing codes, QR downloads, moderation queues, reveal schedules, and 1-click bulk ZIP downloads.',
    steps: [
      'Open Planner and go to the Photos tab.',
      'Configure photo portal settings: require sharing code, set guest upload limits, and select gallery reveal dates.',
      'Download or display the Photo Sharing QR code on reception tables or projector screens.',
      'Guests scan the QR, enter the sharing code if enabled, and upload photos with optional captions.',
      'Review pending photos in the moderation queue from your dashboard or mobile phone.',
      'Approve photos to appear in the shared gallery, or download all approved originals as a bulk ZIP archive.',
    ],
    automated: [
      'High-resolution uploads are securely stored and optimized for mobile viewing.',
      'Sharing codes safeguard your upload portal against unauthorized access.',
      'Bulk ZIP exporter packages all approved photos into a convenient archive for offline archiving.',
    ],
    tips: [
      'Display the photo QR code alongside table numbers or on cocktail napkins.',
      'Keep moderation enabled if you want to curate photos before displaying them on your public site.',
    ],
  },
  'thank-you-notes': {
    title: 'Thank You Email & Card Builder Guide',
    description: 'Prepare and send digital thank-you messages and cards after the wedding.',
    icon: MailCheck,
    overview: 'Thank You tools help couples express gratitude after the wedding with designer email and card templates, couple photos, personalized messages, and delivery tracking.',
    steps: [
      'Open Planner and go to Thanks, or click Thank You from your wedding dashboard.',
      'Choose a thank-you template and adjust the accent colors, font styles, and subject line.',
      'Add a favorite wedding photo from your celebration to give the card a personal touch.',
      'Write personalized messages or select from warm couple presets.',
      'Select recipients from your confirmed guest list and send digital thank-you cards.',
      'Check delivery logs to ensure all attendees receive their note without duplicate sends.',
    ],
    automated: [
      'Guest email records auto-populate into recipient selectors.',
      'QuickWeds handles reliable transactional email delivery with delivery tracking.',
      'Delivery logs track sent and delivered statuses to prevent duplicate emails.',
    ],
    tips: [
      'Send thank-you cards within 2 to 4 weeks after the wedding while memories are fresh.',
      'Include a direct link to your Post-Wedding gallery so guests can view and download photos.',
    ],
  },
  'qr-codes-sharing': {
    title: 'QR Codes and Sharing Guide',
    description: 'Use guest links, RSVP QR codes, seat finder QR codes, and printed sharing.',
    icon: QrCode,
    overview: 'QR codes let guests access your wedding website, RSVP form, Seat Finder, and photo gallery instantly from mobile phones without typing long web addresses.',
    steps: [
      'Copy your public wedding link from the dashboard for digital sharing (chat, email, SMS).',
      'Download print-ready QR codes from Event QR Kit for your invitation suite and signage.',
      'Place the website QR on invitations and save-the-date cards.',
      'Place the Seat Finder QR at the venue entrance or reception greeting table.',
      'Display the Photo Upload QR on dining tables and the bar area.',
      'Always test printed QR codes with phone cameras before mass printing.',
    ],
    automated: [
      'Custom domains and vanity URLs are automatically embedded into your QR codes.',
      'Seat Finder QR opens the mobile guest lookup page for your specific wedding.',
      'QR images generate in crisp, high-resolution formats suitable for large signage.',
    ],
    tips: [
      'Test your printed QR codes under normal venue lighting conditions.',
      'Pair QR codes with a short, helpful prompt like "Scan to find your seat" or "Scan to share photos".',
    ],
  },
  'honeymoon-planner': {
    title: 'Honeymoon Planner Guide',
    description: 'Track honeymoon ideas, travel bookings, suppliers, statuses, and costs.',
    icon: Plane,
    overview: 'The Honeymoon Planner keeps post-wedding travel ideas, flight numbers, hotel bookings, excursions, and travel budgets organized alongside the rest of your wedding planning.',
    steps: [
      'Open Planner and navigate to the Honeymoon tab.',
      'Add itinerary items categorized by Flight, Hotel, Activity, Transport, or Tour Package.',
      'Record destination details, dates, booking links, flight numbers, and supplier contacts.',
      'Track estimated costs, booked quotes, deposits paid, and remaining balances.',
      'Update status flags (Idea, Quoted, Booked, Paid, Completed) as travel plans solidify.',
      'Use the itinerary on your mobile device as a quick travel companion during your trip.',
    ],
    automated: [
      'Honeymoon items remain securely organized within your wedding planner workspace.',
      'Planner Pro removes item limits for comprehensive multi-destination trip planning.',
    ],
    tips: [
      'Save direct confirmation links and agency contact numbers for quick reference during travel.',
      'Track your honeymoon budget here so you have a complete picture of your total wedding celebration costs.',
    ],
  },
  'wedding-day-mode': {
    title: 'Wedding Day Mode & Coordinator Tools Guide',
    description: 'Prepare event-day links, toggles, reminders, coordinator notes, and reports.',
    icon: PartyPopper,
    overview: 'Wedding Day Mode puts real-time controls in the hands of the couple or coordinator: public tool toggles, Event QR Kit, photo uploads, live seating arrival counters, coordinator notes, and 1-click printable coordinator run sheets.',
    steps: [
      'Open your wedding dashboard and choose Wedding Day Mode.',
      'Review live counters: confirmed guests, seated guests, arrival check-in percentage, and photo uploads.',
      'Toggle public tools on or off (e.g., turn on Seat Finder when doors open, enable Photo Uploads during reception).',
      'Add coordinator notes for vendor arrival windows, family VIP contacts, and transport schedules.',
      'Open or print the Coordinator Report for a complete run sheet with guest lists, table charts, and vendor contacts.',
      'Send a photo upload reminder email to attending guests during the reception.',
    ],
    automated: [
      'Wedding Day Mode aggregates live counts from guest RSVPs, seating charts, and photo uploads.',
      'Real-time toggles instantly control visibility of guest-facing public tools.',
      'Printable Coordinator Report pulls all planner contacts, timelines, and floor plans into a clean document.',
    ],
    tips: [
      'Share coordinator access with your day-of coordinator so they can run check-ins directly.',
      'Keep coordinator notes updated with phone numbers for key bridal party contacts and drivers.',
    ],
  },
  'event-qr-kit': {
    title: 'Event QR Kit Guide',
    description: 'Download print-ready QR codes for all guest-facing wedding tools.',
    icon: QrCode,
    overview: 'Event QR Kit generates high-resolution, downloadable QR codes for your wedding website, RSVP form, Seat Finder, Photo Uploads, and Thank You recap so you can print the right code for every phase of your wedding.',
    steps: [
      'Open Event QR Kit from your dashboard, Planner, or Wedding Day Mode.',
      'Review the available QR codes and their designated destinations.',
      'Download high-resolution image files for invitations, welcome signage, table cards, or menus.',
      'Use the Website and RSVP QR codes for pre-wedding invitations.',
      'Use the Seat Finder and Photo Upload QR codes at the wedding venue.',
      'Use the Thank You QR code for post-wedding favors or digital thank-you notes.',
    ],
    automated: [
      'QR Kit builds clean destination URLs for your specific wedding website.',
      'Custom vanity domains are incorporated into QR links when configured.',
      'Images download as high-clarity PNG files ready for print designers.',
    ],
    tips: [
      'Ensure printed QR codes are at least 1.5 x 1.5 inches for comfortable scanning.',
      'Add high-contrast borders around QR codes on decorated signage for reliable camera detection.',
    ],
  },
  'collaboration-access': {
    title: 'Collaboration Access Guide',
    description: 'Invite a partner, coordinator, or helper to work inside your wedding workspace.',
    icon: ShieldCheck,
    overview: 'Collaboration Access allows wedding owners to invite trusted partners, coordinators, or family helpers into their wedding workspace without sharing account passwords.',
    steps: [
      'Open the wedding dashboard and navigate to Team or Collaboration Access.',
      'Enter the collaborator’s email address.',
      'Select their role: Partner (full access) or Coordinator (planning logistics and day-of tools).',
      'Send the collaboration invitation.',
      'The invited person signs in with their email and accepts the invitation on their dashboard.',
      'Revoke access anytime when planning support is no longer needed.',
    ],
    automated: [
      'Invite status indicates pending, accepted, or expired status.',
      'Free accounts include 1 partner collaborator; Planner Pro unlocks coordinators and multiple helpers.',
      'Collaborators only see the specific wedding they were invited to.',
    ],
    tips: [
      'Invite your day-of coordinator early so they can familiarize themselves with the seating plan and vendors.',
      'Assign the Partner role to your fiancé so you both can build the website and review RSVPs simultaneously.',
    ],
  },
  'analytics-reminders': {
    title: 'Analytics and RSVP Reminders Guide',
    description: 'Track website traffic, QR scans, RSVP conversion, and automated reminder blasts.',
    icon: BarChart3,
    overview: 'Analytics and RSVP Reminders provide visibility into how guests are engaging with your site, tracking total views, unique visitors, QR scans, and conversion rates, while enabling 1-click reminder emails to pending guests.',
    steps: [
      'Open your wedding dashboard and select Analytics.',
      'Review key metrics: total visits, unique guests, QR code scans, and RSVP conversion rates.',
      'Check the count of pending guests who have not yet responded.',
      'Click "Send RSVP Reminder" to automatically email guests who have pending invitations.',
      'Review reminder dispatch logs, sent timestamps, and subsequent response rates.',
      'Use insights to decide whether to follow up with certain guests by phone or message.',
    ],
    automated: [
      'Website visits and QR scans are tracked anonymously with privacy-conscious analytics.',
      'Reminder emails automatically target only guests with pending RSVP status.',
      'Performance logs update as guests open reminders and confirm attendance.',
    ],
    tips: [
      'Send reminders 1 to 2 weeks before your RSVP deadline, and again 3 days before cutoff.',
      'Ensure guest email addresses are accurate before initiating a reminder dispatch.',
    ],
  },
  'theme-marketplace-presets': {
    title: 'Theme Marketplace & Presets Guide',
    description: 'Apply curated themes, reusable section blocks, and saved website presets.',
    icon: WandSparkles,
    overview: 'Theme Marketplace and Presets help couples build faster by applying curated design themes, prebuilt content section blocks, and saving custom website layouts for instant reuse.',
    steps: [
      'Open the website builder and open the Theme Marketplace panel.',
      'Browse curated designer presets like Editorial Luxe, Garden Weekend, Modern City, or Vintage Romance.',
      'Click "Apply Preset" to instantly populate harmonized layouts, colors, and sample copy.',
      'Insert reusable section blocks for multi-event timelines, registry guidelines, or story highlights.',
      'Fine-tune the copy, couple photos, and color palette to match your personal wedding aesthetic.',
      'Save your customized layout as a reusable preset if you manage multiple weddings or want a backup.',
    ],
    automated: [
      'Curated presets apply cohesive fonts, section ordering, motif colors, and styling rules.',
      'Prebuilt blocks provide copy templates written by professional wedding planners.',
      'Custom presets save securely to your user account for future use.',
    ],
    tips: [
      'Use presets as an inspiring foundation, then customize names, dates, venue details, and photos.',
      'Preview on mobile viewports after applying presets to see how sections stack on phones.',
    ],
  },
  'community-reviews': {
    title: 'Community Reviews & Couple Stories Guide',
    description: 'Share your wedding planning journey, read advice from real couples, and explore verified community reviews.',
    icon: Star,
    overview: 'Community Reviews & Couple Stories connects QuickWeds couples to exchange genuine tips, vendor praise, and planning insights. Couples can leave 1-5 star ratings, submit photos, highlight standout suppliers, and earn Verified Couple badges.',
    steps: [
      'Visit the Reviews page (/reviews) and click "Share Your Story".',
      'Enter your couple names, wedding role, a highlight quote, overall rating (1–5 stars), and optional wedding story.',
      'Submit the review for verification. Once approved by our team, your review appears on the community hub.',
      'Browse stories from other couples for vendor recommendations, budget tips, and wedding day inspiration.',
    ],
    automated: [
      'Verified Couple badges are displayed on approved community reviews.',
      'Community rating statistics (average score, 5-star ratio) recalculate dynamically upon new approvals.',
      'Admin notification alerts trigger 1-click review moderation.',
    ],
    tips: [
      'Mention specific vendors (photographers, caterers, stylists) so other couples can find trusted talent.',
      'Include budget tips or timing advice that proved valuable on your big day.',
    ],
  },
  'supplier-profiles': {
    title: 'Supplier Profiles & Directory Guide',
    description: 'Create, edit, submit, and manage a wedding business directory profile.',
    icon: Building2,
    overview: 'Supplier Profiles let wedding professionals showcase their portfolio, service packages, service areas, and direct contact channels in the public QuickWeds Wedding Directory.',
    steps: [
      'Click "List Your Business" on the homepage or visit the Supplier Signup page.',
      'Create or sign in to your QuickWeds supplier account.',
      'Open the Supplier Dashboard to build your public profile.',
      'Add business name, categories (Photo, Video, Catering, Venue, HMUA, etc.), portfolio images, and pricing guides.',
      'Include direct contact links: website, Instagram, Facebook, phone, WhatsApp, and email.',
      'Submit your profile for admin verification. Approved profiles appear in the public directory.',
    ],
    automated: [
      'Submitted supplier profiles undergo administrative review before publishing.',
      'Approved suppliers appear in directory searches and can be saved into couple planners.',
      'Couples can view contact channels and inquire directly with vendors.',
    ],
    tips: [
      'Upload bright, high-resolution portfolio photos showcasing real wedding work.',
      'Keep your service areas and social media links updated so couples can easily get in touch.',
    ],
  },
} as const;

type GuideSlug = keyof typeof guides;

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug as GuideSlug];
  if (!guide) return {};
  return {
    title: `${guide.title} | QuickWeds`,
    description: guide.description,
    alternates: {
      canonical: `/user-guide/${slug}`,
    },
    openGraph: {
      title: `${guide.title} | QuickWeds`,
      description: guide.description,
      url: `/user-guide/${slug}`,
      siteName: 'QuickWeds',
      type: 'article',
    },
  };
}

export default async function FeatureGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides[slug as GuideSlug];
  if (!guide) notFound();
  const Icon = guide.icon;

  return (
    <main className="min-h-screen bg-neutral px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/user-guide" className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/30 hover:text-primary sm:w-fit">
            <ArrowLeft className="h-4 w-4" />
            User Guide Hub
          </Link>
          <div className="flex gap-2">
            <Link href="/builder" className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary">
              Website Builder
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-primary-hover">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <header className="overflow-hidden rounded-[1.5rem] border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Icon className="h-4 w-4" />
            QuickWeds Official Feature Guide
          </div>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight text-foreground sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-text-secondary sm:text-lg">
            {guide.overview}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[1.5rem] border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <Send className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Step-by-Step Setup</h2>
            </div>
            <ol className="space-y-3.5 text-sm leading-7 text-text-secondary sm:text-base">
              {guide.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">What Is Automated</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-text-secondary">
              {guide.automated.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl bg-neutral p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-primary/15 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Best Practice Tips</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guide.tips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-border bg-neutral p-5 text-sm leading-6 text-text-secondary">
                {tip}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-white p-6 sm:flex-row">
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Need more help?</h3>
            <p className="text-sm text-text-secondary">Explore all guides or contact our support team anytime.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/user-guide" className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-colors">
              Browse All Guides
            </Link>
            <Link href="/support" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
