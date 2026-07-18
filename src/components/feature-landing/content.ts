export type FeatureKey = 'budget' | 'checklist' | 'rsvp' | 'seating' | 'website';

export type FeatureContent = {
  key: FeatureKey;
  path: string;
  shortName: string;
  title: string;
  description: string;
  keyword: string;
  keywords: string[];
  eyebrow: string;
  headline: string;
  highlight: string;
  subheadline: string;
  demoLabel: string;
  demoTitle: string;
  demoDescription: string;
  features: Array<{ title: string; body: string; icon: string }>;
  benefits: string[];
  steps: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export const featureContent: Record<FeatureKey, FeatureContent> = {
  budget: {
    key: 'budget',
    path: '/wedding-budget-planner',
    shortName: 'Budget Planner',
    title: 'Free Wedding Budget Planner & Calculator | QuickWeds',
    description: 'Plan wedding expenses with a free wedding budget planner and calculator. Track payments, remaining costs, and every category with QuickWeds.',
    keyword: 'wedding budget planner',
    keywords: ['wedding budget planner', 'wedding budget calculator', 'wedding budget template', 'wedding expenses', 'wedding cost calculator'],
    eyebrow: 'Free wedding budget planner',
    headline: 'Plan your dream wedding',
    highlight: 'without overspending.',
    subheadline: 'Track every wedding expense, calculate your total budget, collaborate with your partner, and stay organized from engagement to wedding day.',
    demoLabel: 'Try the calculator',
    demoTitle: 'A budget that stays in view.',
    demoDescription: 'Adjust the budget and see how every category affects the celebration you are planning.',
    features: [
      { title: 'One clear total', body: 'See paid, due, and remaining costs without bouncing between spreadsheets.', icon: 'WalletCards' },
      { title: 'Category clarity', body: 'Group expenses by venue, food, attire, photography, and the details that matter.', icon: 'PieChart' },
      { title: 'Shared decisions', body: 'Keep your partner or planner aligned around the same source of truth.', icon: 'HeartHandshake' },
    ],
    benefits: ['Feel confident before you book', 'Spot overspending before it becomes stressful', 'Keep deposits, due dates, and notes together'],
    steps: [
      { title: 'Set your total', body: 'Start with the number that feels right for your wedding.' },
      { title: 'Add real costs', body: 'Log estimates, deposits, and final payments as you plan.' },
      { title: 'Plan with calm', body: 'Use the remaining balance to guide every next decision.' },
    ],
    faq: [
      { question: 'Is the QuickWeds wedding budget planner free?', answer: 'Yes. You can start planning your wedding budget in QuickWeds for free and keep your essential expenses organized in one place.' },
      { question: 'Can I use this as a wedding budget calculator?', answer: 'Yes. Add your target budget and category expenses to see the amount remaining and how your spending is distributed.' },
      { question: 'Can my partner help manage the wedding budget?', answer: 'Yes. QuickWeds supports collaboration so the people planning with you can stay on the same page.' },
    ],
  },
  checklist: {
    key: 'checklist',
    path: '/wedding-checklist',
    shortName: 'Wedding Checklist',
    title: 'Free Wedding Checklist & Timeline | QuickWeds',
    description: 'Stay organized with a free wedding checklist and timeline. Track due dates, planning progress, and shared tasks with QuickWeds.',
    keyword: 'wedding checklist',
    keywords: ['wedding checklist', 'wedding planning checklist', 'printable wedding checklist', 'wedding timeline'],
    eyebrow: 'Free wedding checklist',
    headline: 'Never forget another',
    highlight: 'wedding task again.',
    subheadline: 'A flexible wedding planning checklist with due dates, milestones, and a shared view for every person helping bring your day together.',
    demoLabel: 'Try the checklist',
    demoTitle: 'Your next right step, right on time.',
    demoDescription: 'Check off a few tasks to see how a living wedding timeline keeps your plans moving.',
    features: [
      { title: 'Smart checklist', body: 'Start with proven tasks, then make the list completely your own.', icon: 'ListTodo' },
      { title: 'Built-in timeline', body: 'See what needs attention now, next month, and before the big day.', icon: 'CalendarClock' },
      { title: 'Shared progress', body: 'Assign and complete tasks together without reminder overload.', icon: 'UsersRound' },
    ],
    benefits: ['Replace planning panic with a clear path', 'Give every helper a useful next step', 'Keep important deadlines from slipping through'],
    steps: [
      { title: 'Choose your date', body: 'Let your wedding date anchor every milestone.' },
      { title: 'Make it yours', body: 'Add custom tasks for your traditions, priorities, and vendors.' },
      { title: 'Celebrate progress', body: 'Check things off and always know what matters next.' },
    ],
    faq: [
      { question: 'Is this wedding checklist free?', answer: 'Yes. QuickWeds gives couples a free way to start organizing essential wedding tasks and planning milestones.' },
      { question: 'Can I create a personalized wedding planning checklist?', answer: 'Yes. You can add custom tasks and shape the plan around your date, wedding style, and priorities.' },
      { question: 'Can I share my checklist with my partner?', answer: 'Yes. Collaboration keeps both of you aware of progress, upcoming dates, and what needs a decision.' },
    ],
  },
  rsvp: {
    key: 'rsvp',
    path: '/wedding-rsvp',
    shortName: 'Wedding RSVP',
    title: 'Free Wedding RSVP Website & Guest Manager | QuickWeds',
    description: 'Create a free wedding RSVP website and track guest responses with QuickWeds. Manage online RSVPs, meal choices, plus-ones, and reminders.',
    keyword: 'wedding RSVP',
    keywords: ['wedding RSVP', 'online RSVP', 'wedding RSVP website', 'RSVP tracker', 'guest management'],
    eyebrow: 'Free online wedding RSVP',
    headline: 'Collect wedding RSVPs',
    highlight: 'in minutes.',
    subheadline: 'Give guests a simple, beautiful way to respond while you keep invitations, meal selections, plus-ones, and follow-ups organized.',
    demoLabel: 'Try the RSVP dashboard',
    demoTitle: 'Every response, beautifully organized.',
    demoDescription: 'Switch a guest status to see how quickly a scattered RSVP list becomes a clear plan.',
    features: [
      { title: 'Guest-friendly RSVP', body: 'A polished mobile experience makes it easy for guests to say yes.', icon: 'MailCheck' },
      { title: 'QR-ready sharing', body: 'Share a link or QR code from invitations, messages, and your wedding website.', icon: 'QrCode' },
      { title: 'Helpful details', body: 'Capture meal choices, plus-ones, and the notes you need before the day.', icon: 'UtensilsCrossed' },
    ],
    benefits: ['Know your numbers before your final vendor count', 'Follow up with pending guests thoughtfully', 'Keep guest answers alongside the rest of your plan'],
    steps: [
      { title: 'Create your RSVP page', body: 'Add the details guests need and match it to your wedding site.' },
      { title: 'Share your link', body: 'Send a beautiful, mobile-ready RSVP experience anywhere your guests are.' },
      { title: 'Watch responses arrive', body: 'Use your live dashboard to plan meals, seating, and reminders.' },
    ],
    faq: [
      { question: 'Can I create a free wedding RSVP website?', answer: 'Yes. QuickWeds lets couples create a wedding website and collect RSVPs online without asking guests to download an app.' },
      { question: 'Can guests select meals and add a plus-one?', answer: 'QuickWeds is built to organize guest details such as RSVP status, meal selections, and plus-one information.' },
      { question: 'Can I send RSVP reminders?', answer: 'QuickWeds helps you identify pending guests so you can follow up with the people who have not responded yet.' },
    ],
  },
  seating: {
    key: 'seating',
    path: '/wedding-seating-chart',
    shortName: 'Seating Chart',
    title: 'Wedding Seating Chart Maker | QuickWeds',
    description: 'Design a beautiful wedding seating chart with QuickWeds. Assign guests to tables, plan seats, and share a QR seat search for your celebration.',
    keyword: 'wedding seating chart',
    keywords: ['wedding seating chart', 'seating planner', 'seating chart maker', 'table planner'],
    eyebrow: 'Wedding seating chart maker',
    headline: 'Design your perfect',
    highlight: 'seating plan.',
    subheadline: 'Move from guest list to table plan with a visual wedding seating chart that makes every assignment feel clear and considered.',
    demoLabel: 'Try the seating planner',
    demoTitle: 'A place for every guest.',
    demoDescription: 'Drag a guest between tables in this live preview, then see how the room starts to take shape.',
    features: [
      { title: 'Visual table planner', body: 'Arrange tables the way your reception room will actually feel.', icon: 'Armchair' },
      { title: 'Guest assignments', body: 'Move guests from your list to a seat without losing the bigger picture.', icon: 'UsersRound' },
      { title: 'QR seat search', body: 'Help guests find their table quickly with a simple arrival experience.', icon: 'QrCode' },
    ],
    benefits: ['Make table decisions with everyone visible', 'Avoid duplicate assignments and seat-search chaos', 'Carry your seating plan through to the wedding day'],
    steps: [
      { title: 'Bring in your guests', body: 'Start with your RSVP list and confirmed guests.' },
      { title: 'Place your tables', body: 'Set up the layout that works for your venue and guest count.' },
      { title: 'Assign with confidence', body: 'Move guests, review balance, and share the final plan.' },
    ],
    faq: [
      { question: 'Is QuickWeds a wedding seating chart maker?', answer: 'Yes. QuickWeds helps couples organize guests and create a visual seating plan for their wedding reception.' },
      { question: 'Can I move guests between tables?', answer: 'Yes. The seating planner is designed for flexible assignments as RSVPs and table ideas change.' },
      { question: 'Can guests find their seat using a QR code?', answer: 'QuickWeds includes QR-friendly seat-finder tools to make arrival smoother for guests and hosts.' },
    ],
  },
  website: {
    key: 'website',
    path: '/wedding-website-builder',
    shortName: 'Website Builder',
    title: 'Free Wedding Website Builder | QuickWeds',
    description: 'Create a free wedding website with QuickWeds. Share your story, RSVP, venue, schedule, gallery, registry, and FAQs in one beautiful place.',
    keyword: 'wedding website builder',
    keywords: ['wedding website builder', 'free wedding website', 'wedding website', 'create wedding website'],
    eyebrow: 'Free wedding website builder',
    headline: 'Create a beautiful wedding',
    highlight: 'website in minutes.',
    subheadline: 'Bring your story, venue, RSVP, schedule, gallery, registry, and guest questions together in a website that feels like your celebration.',
    demoLabel: 'Try the live preview',
    demoTitle: 'Your celebration, in one beautiful link.',
    demoDescription: 'Choose a style and watch a responsive wedding website preview update instantly.',
    features: [
      { title: 'Made-for-you pages', body: 'Share your story, schedule, venue, registry, gallery, and FAQs in one calm home.', icon: 'PanelsTopLeft' },
      { title: 'Built-in RSVP', body: 'Make it easy for guests to respond without juggling separate tools.', icon: 'Send' },
      { title: 'Looks great everywhere', body: 'A polished design for phones, tablets, and the people you love most.', icon: 'Smartphone' },
    ],
    benefits: ['Give guests one trustworthy source for every detail', 'Launch without needing design or coding skills', 'Connect your website directly to your RSVP and planning tools'],
    steps: [
      { title: 'Choose a look', body: 'Start with a wedding template that feels like you.' },
      { title: 'Add your details', body: 'Fill in your story, event information, photos, and guest essentials.' },
      { title: 'Share with joy', body: 'Send your personal link and let QuickWeds keep the details organized.' },
    ],
    faq: [
      { question: 'Is the QuickWeds wedding website builder free?', answer: 'Yes. You can create and share a free wedding website with the essential details guests need.' },
      { question: 'What can I include on my wedding website?', answer: 'QuickWeds gives you room for your story, event details, venue, schedule, gallery, RSVP, registry, and frequently asked questions.' },
      { question: 'Can I use my wedding website on mobile?', answer: 'Yes. QuickWeds wedding websites are designed to be easy to view and use from phones, tablets, and desktop browsers.' },
    ],
  },
};

export const featureKeys = Object.keys(featureContent) as FeatureKey[];
