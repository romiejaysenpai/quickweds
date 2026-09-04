import * as React from 'react';
import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from '@react-email/components';

const C = {
    primary: '#D16C78',
    primaryDark: '#B85A66',
    primaryLight: '#F2D0D5',
    blush: '#FFF1F3',
    cream: '#FFF8F4',
    creamDeep: '#F8E8DE',
    champagne: '#D6B87C',
    champagneSoft: '#F8EBCD',
    sage: '#6E8B7A',
    sageSoft: '#EFF7F2',
    ink: '#2D2A2E',
    muted: '#6B5E62',
    faint: '#9B8E92',
    line: '#F0E0E3',
    white: '#FFFFFF',
    success: '#4A9B7E',
    successSoft: '#F0F9F4',
    error: '#C45B6B',
    errorSoft: '#FFF0F2',
} as const;

const FONT_HEADING = 'Georgia, Times New Roman, serif';
const FONT_BODY = 'Helvetica Neue, Helvetica, Arial, sans-serif';

/**
 * QuickWeds email typography scale.
 * One spec shared by every template: serif display for headings,
 * sans for body, and a single tracking scale for labels/eyebrows.
 */
const T = {
    display: '34px',
    h1: '32px',
    h2: '26px',
    h3: '18px',
    body: '16px',
    small: '14px',
    caption: '13px',
    label: '11px',
    headingLh: '1.15',
    bodyLh: '1.7',
    labelLs: '0.16em',
    eyebrowLs: '0.18em',
} as const;
const SUPABASE_IMG = 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images';

const IMG = {
    logo: `${SUPABASE_IMG}/Untitled%20-%2009%20July%202026%20at%2002.51.57%20(16).png`,
    heroWelcome: `${SUPABASE_IMG}/Wedding%20Website%20Builder.png`,
    heroRsvp: `${SUPABASE_IMG}/Smart%20RSVP%20Management.png`,
    heroReminder: `${SUPABASE_IMG}/2df72133-22a1-4b56-9612-38513a3c3ef3.png`,
} as const;

export type WeddingEmailProps = {
    guestName: string;
    guestEmail?: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime?: string;
    venueName?: string;
    venueAddress?: string;
    mapsLink?: string;
    weddingUrl: string;
    attendance: string;
    numGuests: number;
    guestCode?: string;
    checkInUrl?: string;
    confirmationImageUrl?: string;
    message?: string;
    dietaryDetails?: string;
    songRequest?: string;
    plusOneNames?: string | string[];
    childrenCount?: number;
    dashboardUrl?: string;
    weddingTitle?: string;
};

type ShellProps = {
    title: string;
    preview: string;
    navItems?: string[];
    hero?: {
        image?: string;
        alt: string;
        eyebrow: string;
        heading: React.ReactNode;
        subheading?: React.ReactNode;
        badge?: string;
    };
    heroSlot?: React.ReactNode;
    children: React.ReactNode;
    footerNote?: React.ReactNode;
};

type FeatureItem = {
    label: string;
    title: string;
    body: string;
};

type DetailItem = {
    label: string;
    value?: React.ReactNode;
};

function QuickWedsShell({ title, preview, navItems = ['Site', 'RSVP', 'Planner'], hero, heroSlot, children, footerNote }: ShellProps) {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={bodyStyle}>
                <Section style={outerWrapStyle}>
                    <Container style={containerStyle}>
                        <Section style={topStripStyle}>
                            <Row>
                                <Column style={brandColumnStyle}>
                                    <Img src={IMG.logo} alt="QuickWeds" width="128" style={logoStyle} />
                                </Column>
                                <Column style={navColumnStyle}>
                                    <Text style={navTextStyle}>{navItems.join('  |  ')}</Text>
                                </Column>
                            </Row>
                        </Section>
                        {heroSlot || (hero ? <HeroPanel {...hero} /> : null)}
                        {children}
                        <PremiumFooter footerNote={footerNote} />
                    </Container>
                </Section>
            </Body>
        </Html>
    );
}

type HeroConfig = NonNullable<ShellProps['hero']>;

function HeroPanel({ image, alt, eyebrow, heading, subheading, badge }: HeroConfig) {
    return (
        <Section style={heroPanelStyle}>
            {image ? <Img src={image} alt={alt} width="640" style={heroImageStyle} /> : null}
            <Section style={heroCopyStyle}>
                {badge ? <Text style={heroBadgeStyle}>{badge}</Text> : null}
                <Text style={eyebrowStyle}>{eyebrow}</Text>
                <Heading as="h1" style={heroHeadingStyle}>{heading}</Heading>
                {subheading ? <Text style={heroSubheadingStyle}>{subheading}</Text> : null}
            </Section>
        </Section>
    );
}

function RsvpConfirmationHero({
    image,
    alt,
    eyebrow,
    heading,
    subheading,
    badge,
}: HeroConfig) {
    return (
        <Section style={rsvpHeroPanelStyle}>
            <Section style={rsvpHeroCopyStyle}>
                {badge ? <Text style={heroBadgeStyle}>{badge}</Text> : null}
                <Text style={eyebrowStyle}>{eyebrow}</Text>
                <Heading as="h1" style={rsvpHeroHeadingStyle}>{heading}</Heading>
                {subheading ? <Text style={rsvpHeroSubheadingStyle}>{subheading}</Text> : null}
            </Section>
            {image ? (
                <Section style={rsvpHeroImageFrameStyle}>
                    <Img src={image} alt={alt} width="536" style={rsvpHeroImageStyle} />
                </Section>
            ) : null}
        </Section>
    );
}

function PromoBand({ label, title, body }: { label: string; title: React.ReactNode; body: React.ReactNode }) {
    return (
        <Section style={promoBandStyle}>
            <Text style={promoLabelStyle}>{label}</Text>
            <Heading as="h2" style={promoTitleStyle}>{title}</Heading>
            <Text style={promoBodyStyle}>{body}</Text>
        </Section>
    );
}

function FeatureGrid({ items }: { items: FeatureItem[] }) {
    const rows: FeatureItem[][] = [];
    for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

    return (
        <Section style={contentSectionStyle}>
            {rows.map((row, rowIndex) => (
                <Row key={`feature-row-${rowIndex}`} style={featureRowStyle}>
                    {row.map((item) => (
                        <Column key={item.title} style={featureColumnStyle}>
                            <Section style={featureCardStyle}>
                                <Text style={featureLabelStyle}>{item.label}</Text>
                                <Text style={featureTitleStyle}>{item.title}</Text>
                                <Text style={featureBodyStyle}>{item.body}</Text>
                            </Section>
                        </Column>
                    ))}
                    {row.length === 1 ? <Column style={featureColumnStyle} /> : null}
                </Row>
            ))}
        </Section>
    );
}

function DetailCard({ title, items, children, tint = false }: { title: string; items?: DetailItem[]; children?: React.ReactNode; tint?: boolean }) {
    return (
        <Section style={tint ? detailCardTintStyle : detailCardStyle}>
            <Text style={sectionLabelStyle}>{title}</Text>
            {items?.map((item) => <DetailRow key={item.label} label={item.label} value={item.value} />)}
            {children}
        </Section>
    );
}

function DetailRow({ label, value }: DetailItem) {
    if (!value) return null;
    return (
        <Row>
            <Column style={detailLabelStyle}>
                <Text style={detailLabelTextStyle}>{label}</Text>
            </Column>
            <Column>
                <Text style={detailValueStyle}>{value}</Text>
            </Column>
        </Row>
    );
}

function MetricBadge({ label, value, tone = 'neutral' }: { label: string; value: React.ReactNode; tone?: 'neutral' | 'success' | 'error' }) {
    const style = tone === 'success' ? metricSuccessStyle : tone === 'error' ? metricErrorStyle : metricNeutralStyle;
    return (
        <Section style={style}>
            <Text style={metricLabelStyle}>{label}</Text>
            <Heading as="h2" style={metricValueStyle}>{value}</Heading>
        </Section>
    );
}

function TimelineSteps({ steps }: { steps: { title: string; body: string }[] }) {
    return (
        <Section style={timelineStyle}>
            {steps.map((step, index) => (
                <Row key={step.title}>
                    <Column style={timelineNumberColumnStyle}>
                        <Text style={timelineNumberStyle}>{index + 1}</Text>
                    </Column>
                    <Column>
                        <Text style={timelineTitleStyle}>{step.title}</Text>
                        <Text style={timelineBodyStyle}>{step.body}</Text>
                    </Column>
                </Row>
            ))}
        </Section>
    );
}

function GuestPassCard({ guestCode, checkInUrl, partyLabel }: { guestCode?: string; checkInUrl?: string; partyLabel: string }) {
    const qrImageUrl = checkInUrl ? `https://quickchart.io/qr?size=240&margin=2&text=${encodeURIComponent(checkInUrl)}` : '';

    return (
        <Section style={guestPassStyle}>
            <Text style={guestPassKickerStyle}>QuickWeds Guest Pass</Text>
            <Text style={guestPassTitleStyle}>{partyLabel}</Text>
            {qrImageUrl ? (
                <Section style={qrWrapStyle}>
                    <Img src={qrImageUrl} alt="Wedding check-in QR code" width="176" height="176" style={qrImageStyle} />
                </Section>
            ) : null}
            {guestCode ? <Text style={guestCodeStyle}>{guestCode}</Text> : null}
            <Text style={guestPassBodyStyle}>Keep this email nearby for reception, seating, and event-day updates.</Text>
            {checkInUrl ? <Button href={checkInUrl} style={secondaryButtonStyle}>Open Guest Pass</Button> : null}
        </Section>
    );
}

function Checklist({ items }: { items: string[] }) {
    return (
        <Section style={checklistStyle}>
            {items.map((item) => (
                <Row key={item}>
                    <Column style={checkColumnStyle}>
                        <Text style={checkMarkStyle}>&#10003;</Text>
                    </Column>
                    <Column>
                        <Text style={checkTextStyle}>{item}</Text>
                    </Column>
                </Row>
            ))}
        </Section>
    );
}

function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Section style={buttonWrapStyle}>
            <Button href={href} style={buttonStyle}>{children}</Button>
        </Section>
    );
}

function PremiumFooter({ footerNote }: { footerNote?: React.ReactNode }) {
    return (
        <Section style={footerStyle}>
            <Img src={IMG.logo} alt="QuickWeds" width="96" style={footerLogoStyle} />
            <Text style={footerHeadlineStyle}>Wedding websites, RSVPs, guest updates, and planning tools in one place.</Text>
            {footerNote}
            <Hr style={footerRuleStyle} />
            <Text style={footerLinksStyle}>QuickWeds | Wedding Sites | RSVP Tools | Planner Pro</Text>
            <Text style={legalStyle}>&copy; {new Date().getFullYear()} QuickWeds. All rights reserved.</Text>
        </Section>
    );
}

export function WelcomeEmail({ userName }: { userName: string }) {
    return (
        <QuickWedsShell
            title="Welcome to QuickWeds"
            preview="Start your wedding website, invite guests, and manage the planning details in QuickWeds."
            hero={{
                image: IMG.heroWelcome,
                alt: 'Welcome to QuickWeds',
                eyebrow: 'Welcome Aboard',
                heading: 'Your wedding website can feel complete from day one.',
                subheading: `Hi ${userName}, build a polished invitation, collect RSVPs, and keep every planning detail moving in one calm workspace.`,
                badge: 'New Couple Workspace',
            }}
            footerNote={<Text style={footerTextStyle}>With love from the <strong style={{ color: C.primary }}>QuickWeds</strong> team.</Text>}
        >
            <Section style={contentSectionStyle}>
                <PromoBand
                    label="Start Here"
                    title="Publish the invitation guests can actually use."
                    body="QuickWeds gives you a designer wedding site, RSVP tracking, venue details, reminders, guest photo tools, and planning features without making your guests download anything."
                />
            </Section>
            <FeatureGrid items={[
                { label: '01', title: 'Designer Site', body: 'Choose a template, add your story, and share one beautiful link.' },
                { label: '02', title: 'Smart RSVPs', body: 'Collect attendance, dietary notes, song requests, and guest details.' },
                { label: '03', title: 'Guest Flow', body: 'Keep venue, schedule, photos, gifts, and updates easy to revisit.' },
                { label: '04', title: 'Planner Tools', body: 'Grow into seating, suppliers, reminders, QR tools, and thank-you notes.' },
            ]} />
            <Section style={contentSectionStyle}>
                <DetailCard title="Build Your First Flow" tint>
                    <TimelineSteps steps={[
                        { title: 'Pick the visual direction', body: 'Start from a QuickWeds template that matches the tone of your celebration.' },
                        { title: 'Add the essential details', body: 'Venue, date, RSVP settings, photos, schedule, and guest instructions.' },
                        { title: 'Share one link', body: 'Send your wedding site to guests and manage every response from the dashboard.' },
                    ]} />
                </DetailCard>
            </Section>
            <Section style={contentSectionStyle}>
                <PromoBand
                    label="Planner Preview"
                    title="Ready when planning gets bigger."
                    body="When the guest list grows, Planner Pro adds more room for reminders, seating, collaborators, suppliers, exports, and event-day tools."
                />
            </Section>
            <CtaButton href="https://quickweds.site/builder">Start Building Now</CtaButton>
        </QuickWedsShell>
    );
}

export function GuestConfirmationEmail(props: WeddingEmailProps) {
    const isAttending = props.attendance === 'Yes';
    const partyLabel = `${props.numGuests} guest${props.numGuests === 1 ? '' : 's'}`;
    const confirmationImage = props.confirmationImageUrl;

    return (
        <QuickWedsShell
            title={`RSVP Confirmation - ${props.brideName} & ${props.groomName}`}
            preview={isAttending ? `Your RSVP for ${props.brideName} and ${props.groomName}'s wedding is confirmed.` : `Your RSVP update for ${props.brideName} and ${props.groomName}'s wedding was received.`}
            navItems={['Invitation', 'Details', 'Guest Pass']}
            heroSlot={
                <RsvpConfirmationHero
                    image={confirmationImage}
                    alt={`${props.brideName} and ${props.groomName}'s wedding`}
                    eyebrow="RSVP Confirmation"
                    heading={isAttending ? "You're on the guest list." : 'Your RSVP update was received.'}
                    subheading={`${props.brideName} & ${props.groomName}'s wedding`}
                    badge={isAttending ? 'Confirmed' : 'Received'}
                />
            }
            footerNote={<Text style={footerTextStyle}>Need to update your RSVP? <Link href={props.weddingUrl} style={linkStyle}>Visit the invitation page</Link>.</Text>}
        >
            <Section style={contentSectionStyle}>
                <PromoBand
                    label={isAttending ? 'We cannot wait to celebrate' : 'Thank you for letting us know'}
                    title={isAttending ? <>Hi {props.guestName}, your place is saved.</> : <>Hi {props.guestName}, your response is saved.</>}
                    body={isAttending ? <>We have recorded your RSVP for <strong>{partyLabel}</strong>. Keep this email handy for venue details, check-in, and any last-minute reminders.</> : 'We are sorry you cannot make it, but the couple will see your update in their guest list.'}
                />
            </Section>
            {isAttending ? (
                <>
                    <Section style={contentSectionStyle}>
                        <DetailCard
                            title="Wedding Details"
                            tint
                            items={[
                                { label: 'Date & Time', value: `${props.weddingDate}${props.weddingTime ? ` at ${props.weddingTime}` : ''}` },
                                { label: 'Venue', value: props.venueName },
                                { label: 'Address', value: props.venueAddress },
                            ]}
                        >
                            {props.mapsLink ? <Link href={props.mapsLink} style={inlineButtonStyle}>Open in Google Maps &rarr;</Link> : null}
                        </DetailCard>
                    </Section>
                    <Section style={contentSectionStyle}>
                        <GuestPassCard guestCode={props.guestCode} checkInUrl={props.checkInUrl} partyLabel={partyLabel} />
                    </Section>
                    <FeatureGrid items={[
                        { label: 'Save', title: 'Keep this email', body: 'Your wedding details and guest pass stay easy to find.' },
                        { label: 'Arrive', title: 'Plan your route', body: props.venueName ? 'Check the venue and travel time before leaving.' : 'Review the invitation page before the event.' },
                    ]} />
                    <Section style={contentSectionStyle}>
                        <DetailCard title="Before You Arrive">
                            <Checklist items={[
                                'Save or screenshot this confirmation email.',
                                props.checkInUrl ? 'Open your guest pass before reception.' : 'Revisit the invitation page for final details.',
                                'Check the schedule and venue details before leaving.',
                            ]} />
                        </DetailCard>
                    </Section>
                </>
            ) : null}
            <CtaButton href={props.weddingUrl}>View Full Invitation</CtaButton>
        </QuickWedsShell>
    );
}

export function CoupleRsvpNotificationEmail(props: WeddingEmailProps) {
    const isAttending = props.attendance === 'Yes';
    const plusOnes = Array.isArray(props.plusOneNames) ? props.plusOneNames.join(', ') : props.plusOneNames;
    const dashboardUrl = props.dashboardUrl || props.weddingUrl;

    return (
        <QuickWedsShell
            title="New RSVP Received"
            preview={`${props.guestName} responded ${props.attendance} for ${props.numGuests} guest${props.numGuests === 1 ? '' : 's'}.`}
            navItems={['Dashboard', 'Guests', 'RSVPs']}
            hero={{
                image: props.confirmationImageUrl,
                alt: 'New RSVP received',
                eyebrow: 'Guest Response',
                heading: 'A new RSVP just landed.',
                subheading: props.weddingTitle || `${props.brideName} & ${props.groomName}`,
                badge: isAttending ? 'Confirmed' : 'Updated',
            }}
            footerNote={<Text style={footerTextStyle}>Manage this response from your <Link href={dashboardUrl} style={linkStyle}>QuickWeds dashboard</Link>.</Text>}
        >
            <Section style={contentSectionStyle}>
                <Row>
                    <Column style={metricColumnStyle}>
                        <MetricBadge label="Response" value={isAttending ? 'Yes' : props.attendance} tone={isAttending ? 'success' : 'error'} />
                    </Column>
                    <Column style={metricColumnStyle}>
                        <MetricBadge label="Party Size" value={props.numGuests} />
                    </Column>
                </Row>
            </Section>
            <Section style={contentSectionStyle}>
                <DetailCard
                    title="Guest Details"
                    tint
                    items={[
                        { label: 'Guest', value: props.guestName },
                        { label: 'Email', value: props.guestEmail },
                        { label: 'Attendance', value: props.attendance },
                        { label: 'Party Size', value: `${props.numGuests} guest${props.numGuests === 1 ? '' : 's'}` },
                        { label: 'Plus Ones', value: plusOnes },
                        { label: 'Children', value: props.childrenCount ? String(props.childrenCount) : undefined },
                        { label: 'Dietary', value: props.dietaryDetails },
                        { label: 'Song', value: props.songRequest },
                    ]}
                />
            </Section>
            {props.message ? (
                <Section style={contentSectionStyle}>
                    <DetailCard title="Message for You">
                        <Text style={quoteStyle}>{`“${props.message}”`}</Text>
                    </DetailCard>
                </Section>
            ) : null}
            <FeatureGrid items={[
                { label: 'Next', title: 'Review the guest row', body: 'Confirm party details, notes, and any follow-up needed.' },
                { label: 'Plan', title: 'Keep counts current', body: 'Your dashboard counters update as RSVPs come in.' },
            ]} />
            <CtaButton href={dashboardUrl}>Open Guest List Dashboard</CtaButton>
        </QuickWedsShell>
    );
}

export function GuestReminderEmail(props: WeddingEmailProps) {
    return (
        <QuickWedsShell
            title="Wedding Reminder"
            preview={`${props.brideName} and ${props.groomName}'s wedding is coming up. Review the date, venue, and map.`}
            navItems={['Reminder', 'Venue', 'Map']}
            hero={{
                image: props.confirmationImageUrl,
                alt: 'Wedding countdown',
                eyebrow: 'Friendly Reminder',
                heading: 'The celebration is almost here.',
                subheading: `${props.brideName} & ${props.groomName}`,
                badge: 'Wedding Countdown',
            }}
        >
            <Section style={contentSectionStyle}>
                <PromoBand
                    label="A note for your calendar"
                    title={<>Hi {props.guestName}, here are the details to keep close.</>}
                    body="The couple cannot wait to celebrate with you. Review the timing, venue, and travel details before you head out."
                />
            </Section>
            <Section style={contentSectionStyle}>
                <DetailCard
                    title="Schedule & Venue"
                    tint
                    items={[
                        { label: 'When', value: `${props.weddingDate}${props.weddingTime ? ` at ${props.weddingTime}` : ''}` },
                        { label: 'Where', value: props.venueName },
                        { label: 'Address', value: props.venueAddress },
                    ]}
                >
                    {props.mapsLink ? <Link href={props.mapsLink} style={inlineButtonStyle}>Open in Google Maps &rarr;</Link> : null}
                </DetailCard>
            </Section>
            <FeatureGrid items={[
                { label: 'Bring', title: 'Your invitation link', body: 'Use it to revisit the schedule and guest instructions.' },
                { label: 'Check', title: 'Travel time', body: props.mapsLink ? 'Open the map and save the route before leaving.' : 'Confirm directions and parking before the event.' },
                { label: 'Keep', title: 'This reminder', body: 'It keeps the couple details close on the wedding day.' },
                { label: 'Enjoy', title: 'The celebration', body: 'Arrive ready to celebrate with the couple and their people.' },
            ]} />
            <Section style={contentSectionStyle}>
                <DetailCard title="Quick Checklist">
                    <Checklist items={[
                        'Review the latest invitation details before you leave.',
                        props.mapsLink ? 'Open the map link and save the route.' : 'Confirm travel time and parking before the day.',
                        'Keep this email handy in case the couple shares last-minute updates.',
                    ]} />
                </DetailCard>
            </Section>
            <CtaButton href={props.weddingUrl}>View Wedding Details & Map</CtaButton>
        </QuickWedsShell>
    );
}

export function getWelcomeEmailReact(userName: string) {
    return <WelcomeEmail userName={userName} />;
}

export function getGuestConfirmationReact(props: WeddingEmailProps) {
    return <GuestConfirmationEmail {...props} />;
}

export function getCoupleNotificationReact(props: WeddingEmailProps) {
    return <CoupleRsvpNotificationEmail {...props} />;
}

export function getGuestReminderReact(props: WeddingEmailProps) {
    return <GuestReminderEmail {...props} />;
}

const bodyStyle = {
    margin: 0,
    padding: 0,
    backgroundColor: C.cream,
    color: C.ink,
    fontFamily: FONT_BODY,
};

const outerWrapStyle = {
    width: '100%',
    padding: '32px 0',
    backgroundColor: C.cream,
};

const containerStyle = {
    maxWidth: '640px',
    margin: '0 auto',
    backgroundColor: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: '24px',
    overflow: 'hidden',
};

const topStripStyle = {
    padding: '22px 32px',
    backgroundColor: C.white,
    borderBottom: `1px solid ${C.line}`,
};

const brandColumnStyle = {
    width: '48%',
    verticalAlign: 'middle' as const,
};

const navColumnStyle = {
    width: '52%',
    verticalAlign: 'middle' as const,
    textAlign: 'right' as const,
};

const logoStyle = {
    display: 'block',
};

const navTextStyle = {
    margin: 0,
    color: C.faint,
    fontSize: T.label,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
};

const heroPanelStyle = {
    backgroundColor: C.blush,
};

const heroImageStyle = {
    display: 'block',
    width: '100%',
    maxWidth: '640px',
    height: 'auto',
};

const heroCopyStyle = {
    padding: '38px 44px 42px',
    textAlign: 'center' as const,
    backgroundColor: C.blush,
};

const heroBadgeStyle = {
    display: 'inline-block',
    margin: '0 0 16px',
    padding: '7px 14px',
    backgroundColor: C.white,
    border: `1px solid ${C.primaryLight}`,
    borderRadius: '999px',
    color: C.primaryDark,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
};

const eyebrowStyle = {
    margin: '0 0 12px',
    color: C.primary,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: T.eyebrowLs,
    textTransform: 'uppercase' as const,
};

const heroHeadingStyle = {
    margin: 0,
    color: C.ink,
    fontFamily: FONT_HEADING,
    fontSize: '36px',
    fontWeight: 400,
    lineHeight: '1.12',
};

const heroSubheadingStyle = {
    margin: '16px auto 0',
    maxWidth: '500px',
    color: C.muted,
    fontSize: T.body,
    lineHeight: '1.7',
};

const rsvpHeroPanelStyle = {
    padding: '36px 34px 34px',
    backgroundColor: C.blush,
};

const rsvpHeroCopyStyle = {
    padding: '0 24px 24px',
    textAlign: 'center' as const,
};

const rsvpHeroImageFrameStyle = {
    width: '536px',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '10px',
    backgroundColor: C.white,
    border: `1px solid ${C.primaryLight}`,
    borderRadius: '22px',
};

const rsvpHeroImageStyle = {
    display: 'block',
    width: '100%',
    maxWidth: '536px',
    height: 'auto',
    maxHeight: '360px',
    objectFit: 'cover' as const,
    borderRadius: '16px',
};

const rsvpHeroHeadingStyle = {
    ...heroHeadingStyle,
    fontSize: T.display,
};

const rsvpHeroSubheadingStyle = {
    ...heroSubheadingStyle,
    margin: '16px auto 0',
    maxWidth: '420px',
};

const contentSectionStyle = {
    padding: '14px 36px',
};

const promoBandStyle = {
    padding: '30px',
    backgroundColor: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: '20px',
};

const promoLabelStyle = {
    margin: '0 0 12px',
    color: C.primary,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: T.labelLs,
    textTransform: 'uppercase' as const,
};

const promoTitleStyle = {
    margin: '0 0 14px',
    color: C.ink,
    fontFamily: FONT_HEADING,
    fontSize: T.h2,
    fontWeight: 400,
    lineHeight: T.headingLh,
};

const promoBodyStyle = {
    margin: 0,
    color: C.muted,
    fontSize: T.body,
    lineHeight: T.bodyLh,
};

const featureRowStyle = {
    width: '100%',
};

const featureColumnStyle = {
    width: '50%',
    padding: '0 6px 12px',
    verticalAlign: 'top' as const,
};

const featureCardStyle = {
    minHeight: '132px',
    padding: '22px',
    backgroundColor: C.cream,
    border: `1px solid ${C.line}`,
    borderRadius: '18px',
};

const featureLabelStyle = {
    margin: '0 0 12px',
    color: C.champagne,
    fontSize: T.label,
    fontWeight: 900,
    letterSpacing: T.labelLs,
    textTransform: 'uppercase' as const,
};

const featureTitleStyle = {
    margin: '0 0 8px',
    color: C.ink,
    fontSize: '16px',
    fontWeight: 800,
    lineHeight: '1.35',
};

const featureBodyStyle = {
    margin: 0,
    color: C.muted,
    fontSize: T.caption,
    lineHeight: '1.65',
};

const detailCardStyle = {
    padding: '28px',
    backgroundColor: C.white,
    border: `1px solid ${C.line}`,
    borderRadius: '20px',
};

const detailCardTintStyle = {
    ...detailCardStyle,
    backgroundColor: C.cream,
};

const sectionLabelStyle = {
    margin: '0 0 18px',
    color: C.primary,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
};

const detailLabelStyle = {
    width: '132px',
    padding: '8px 16px 8px 0',
    verticalAlign: 'top' as const,
};

const detailLabelTextStyle = {
    margin: 0,
    color: C.faint,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
};

const detailValueStyle = {
    margin: 0,
    padding: '8px 0',
    color: C.ink,
    fontSize: T.body,
    fontWeight: 600,
    lineHeight: '1.6',
};

const metricColumnStyle = {
    width: '50%',
    padding: '0 6px',
    verticalAlign: 'top' as const,
};

const metricNeutralStyle = {
    padding: '26px 18px',
    backgroundColor: C.cream,
    border: `1px solid ${C.line}`,
    borderRadius: '18px',
    textAlign: 'center' as const,
};

const metricSuccessStyle = {
    ...metricNeutralStyle,
    backgroundColor: C.successSoft,
    border: `1px solid ${C.success}`,
};

const metricErrorStyle = {
    ...metricNeutralStyle,
    backgroundColor: C.errorSoft,
    border: `1px solid ${C.error}`,
};

const metricLabelStyle = {
    margin: '0 0 10px',
    color: C.faint,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
};

const metricValueStyle = {
    margin: 0,
    color: C.ink,
    fontFamily: FONT_HEADING,
    fontSize: T.display,
    fontWeight: 400,
    lineHeight: T.headingLh,
};

const timelineStyle = {
    marginTop: '4px',
};

const timelineNumberColumnStyle = {
    width: '42px',
    padding: '0 14px 20px 0',
    verticalAlign: 'top' as const,
};

const timelineNumberStyle = {
    margin: 0,
    width: '30px',
    height: '30px',
    lineHeight: '30px',
    borderRadius: '999px',
    backgroundColor: C.primary,
    color: C.white,
    textAlign: 'center' as const,
    fontWeight: 800,
};

const timelineTitleStyle = {
    margin: '0 0 5px',
    color: C.ink,
    fontSize: T.small,
    fontWeight: 700,
};

const timelineBodyStyle = {
    margin: '0 0 20px',
    color: C.muted,
    fontSize: T.caption,
    lineHeight: '1.65',
};

const guestPassStyle = {
    padding: '30px',
    backgroundColor: C.ink,
    borderRadius: '22px',
    textAlign: 'center' as const,
};

const guestPassKickerStyle = {
    margin: '0 0 12px',
    color: C.champagneSoft,
    fontSize: T.label,
    fontWeight: 900,
    letterSpacing: T.eyebrowLs,
    textTransform: 'uppercase' as const,
};

const guestPassTitleStyle = {
    margin: '0 0 10px',
    color: C.white,
    fontFamily: FONT_HEADING,
    fontSize: T.h2,
    fontWeight: 400,
    lineHeight: T.headingLh,
};

const guestCodeStyle = {
    margin: '10px auto 16px',
    padding: '13px 18px',
    backgroundColor: C.white,
    borderRadius: '14px',
    color: C.ink,
    fontFamily: FONT_HEADING,
    fontSize: '30px',
    lineHeight: '1.2',
    letterSpacing: '0.14em',
};

const guestPassBodyStyle = {
    margin: '0 auto 18px',
    maxWidth: '410px',
    color: C.champagneSoft,
    fontSize: '14px',
    lineHeight: '1.65',
};

const qrWrapStyle = {
    width: '208px',
    margin: '14px auto 16px',
    padding: '16px',
    backgroundColor: C.white,
    borderRadius: '18px',
};

const qrImageStyle = {
    display: 'block',
    width: '176px',
    height: '176px',
    margin: '0 auto',
    border: '0',
};

const checklistStyle = {
    marginTop: '4px',
};

const checkColumnStyle = {
    width: '30px',
    padding: '7px 0',
    verticalAlign: 'top' as const,
};

const checkMarkStyle = {
    margin: 0,
    color: C.primary,
    fontSize: '16px',
    fontWeight: 900,
};

const checkTextStyle = {
    margin: 0,
    padding: '7px 0',
    color: C.muted,
    fontSize: T.small,
    fontWeight: 500,
    lineHeight: '1.65',
};

const buttonWrapStyle = {
    padding: '16px 36px 44px',
    textAlign: 'center' as const,
};

const buttonStyle = {
    display: 'inline-block',
    padding: '17px 44px',
    backgroundColor: C.primary,
    borderRadius: '999px',
    color: C.white,
    fontSize: T.small,
    fontWeight: 800,
    letterSpacing: '0.04em',
    textDecoration: 'none',
};

const secondaryButtonStyle = {
    display: 'inline-block',
    padding: '13px 28px',
    backgroundColor: C.white,
    borderRadius: '999px',
    color: C.ink,
    fontSize: T.small,
    fontWeight: 800,
    textDecoration: 'none',
};

const inlineButtonStyle = {
    display: 'inline-block',
    marginTop: '14px',
    padding: '11px 18px',
    backgroundColor: C.white,
    border: `1px solid ${C.primaryLight}`,
    borderRadius: '999px',
    color: C.primary,
    fontSize: T.small,
    fontWeight: 800,
    textDecoration: 'none',
};

const footerStyle = {
    padding: '42px 36px',
    backgroundColor: C.primary,
    textAlign: 'center' as const,
};

const footerLogoStyle = {
    display: 'block',
    margin: '0 auto 18px',
};

const footerHeadlineStyle = {
    margin: '0 auto 14px',
    maxWidth: '420px',
    color: C.white,
    fontSize: T.small,
    fontWeight: 700,
    lineHeight: '1.65',
};

const footerTextStyle = {
    margin: '0 0 10px',
    color: C.cream,
    fontSize: T.caption,
    lineHeight: '1.6',
};

const footerRuleStyle = {
    borderColor: 'rgba(255,255,255,0.35)',
    margin: '22px 0',
};

const footerLinksStyle = {
    margin: 0,
    color: C.cream,
    fontSize: T.label,
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
};

const legalStyle = {
    margin: '14px 0 0',
    color: C.cream,
    fontSize: T.label,
    lineHeight: '1.5',
};

const linkStyle = {
    color: C.primaryDark,
    fontWeight: 800,
    textDecoration: 'underline',
};

const quoteStyle = {
    margin: 0,
    color: C.muted,
    fontFamily: FONT_HEADING,
    fontSize: '18px',
    fontStyle: 'italic',
    lineHeight: '1.65',
};
