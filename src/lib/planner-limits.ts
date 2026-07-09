export const FREE_PLAN_LIMITS = {
    guestEmails: 50,
    userTriggeredEmails: 50,
    checklistTasks: 25,
    budgetItems: 10,
    vendors: 5,
    calendarEvents: 5,
    foodDrinks: 5,
    honeymoonItems: 3,
    seatingTables: 3,
    collaborators: 1,
} as const;

export type PlannerItemType = 'task' | 'budget' | 'vendor' | 'event' | 'foodDrink' | 'honeymoon';
export type PlannerEmailEventType = 'rsvp_reminder' | 'seat_link' | 'thank_you' | 'manual_guest_message';

export type PlannerUsage = {
    guestEmailCount: number;
    userTriggeredEmailsUsed: number;
    tasks: number;
    budgets: number;
    vendors: number;
    events: number;
    foodDrinks: number;
    honeymoonItems: number;
    seatingTables: number;
    collaborators: number;
};

export const EMPTY_PLANNER_USAGE: PlannerUsage = {
    guestEmailCount: 0,
    userTriggeredEmailsUsed: 0,
    tasks: 0,
    budgets: 0,
    vendors: 0,
    events: 0,
    foodDrinks: 0,
    honeymoonItems: 0,
    seatingTables: 0,
    collaborators: 0,
};

export const PLANNER_ITEM_LIMITS: Record<PlannerItemType, number> = {
    task: FREE_PLAN_LIMITS.checklistTasks,
    budget: FREE_PLAN_LIMITS.budgetItems,
    vendor: FREE_PLAN_LIMITS.vendors,
    event: FREE_PLAN_LIMITS.calendarEvents,
    foodDrink: FREE_PLAN_LIMITS.foodDrinks,
    honeymoon: FREE_PLAN_LIMITS.honeymoonItems,
};

export const PLANNER_USAGE_KEYS: Record<PlannerItemType, keyof PlannerUsage> = {
    task: 'tasks',
    budget: 'budgets',
    vendor: 'vendors',
    event: 'events',
    foodDrink: 'foodDrinks',
    honeymoon: 'honeymoonItems',
};

export function hasPlannerProAccess(input: {
    isAdmin?: boolean;
    wedding?: { is_premium?: boolean | null; payment_status?: string | null } | null;
    accountProfile?: { is_pro?: boolean | null; payment_status?: string | null } | null;
}) {
    return Boolean(input.isAdmin)
        || Boolean(input.wedding?.is_premium)
        || input.wedding?.payment_status === 'paid'
        || Boolean(input.accountProfile?.is_pro)
        || input.accountProfile?.payment_status === 'paid';
}

export function getPlannerLimitMessage(type: PlannerItemType) {
    const labels: Record<PlannerItemType, string> = {
        task: 'checklist tasks',
        budget: 'budget items',
        vendor: 'saved suppliers/vendors',
        event: 'calendar events',
        foodDrink: 'food and drink items',
        honeymoon: 'honeymoon items',
    };

    return `Free Planner Lite includes ${PLANNER_ITEM_LIMITS[type]} ${labels[type]}. Upgrade to Planner Pro for unlimited planning.`;
}

export function getEmailLimitMessage(needed = 1, used = 0) {
    const remaining = Math.max(0, FREE_PLAN_LIMITS.userTriggeredEmails - used);
    if (remaining <= 0) {
        return 'Your guest list is ready for Pro. Free weddings include 50 guest emails; upgrade to Planner Pro for unlimited guest emails.';
    }
    return `This send needs ${needed} guest email${needed === 1 ? '' : 's'}, but only ${remaining} free guest email${remaining === 1 ? '' : 's'} remain. Upgrade to Planner Pro for unlimited guest emails.`;
}

export function isSchemaMissingError(error: any) {
    const text = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return (
        text.includes('schema cache') ||
        text.includes('does not exist') ||
        text.includes('could not find') ||
        text.includes('column') ||
        error?.code === 'PGRST204' ||
        error?.code === 'PGRST205' ||
        error?.code === '42P01' ||
        error?.code === '42703'
    );
}

async function safeCount(query: any) {
    const result = await query;
    if (result.error) {
        if (isSchemaMissingError(result.error)) return 0;
        throw result.error;
    }
    return Number(result.count || 0);
}

async function safeSumRows(query: any, key: string) {
    const result = await query;
    if (result.error) {
        if (isSchemaMissingError(result.error)) return 0;
        throw result.error;
    }
    return (result.data || []).reduce((total: number, row: Record<string, unknown>) => total + Number(row[key] || 0), 0);
}

export async function getUserTriggeredEmailUsage(db: any, weddingId: string) {
    const tracked = await safeSumRows(
        db.from('planner_email_events').select('recipient_count').eq('wedding_id', weddingId),
        'recipient_count',
    );

    const [reminderRecipients, sentThankYouNotes, sentThankYouEmailLogs, seatLinksSent] = await Promise.all([
        safeSumRows(db.from('wedding_reminders').select('recipient_count').eq('wedding_id', weddingId), 'recipient_count'),
        safeCount(db.from('thank_you_notes').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId).eq('status', 'sent')),
        safeCount(db.from('thank_you_email_logs').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId).eq('status', 'sent')),
        safeCount(db.from('rsvps').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId).not('seat_link_last_sent_at', 'is', null)),
    ]);

    return Math.max(tracked, reminderRecipients + sentThankYouNotes + sentThankYouEmailLogs + seatLinksSent);
}

export async function getPlannerUsage(db: any, weddingId: string): Promise<PlannerUsage> {
    const [
        guestEmailCount,
        userTriggeredEmailsUsed,
        tasks,
        budgets,
        vendors,
        events,
        foodDrinks,
        honeymoonItems,
        seatingTables,
        collaborators,
    ] = await Promise.all([
        safeCount(db.from('rsvps').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId).not('guest_email', 'is', null).neq('guest_email', '')),
        getUserTriggeredEmailUsage(db, weddingId),
        safeCount(db.from('planner_tasks').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('planner_budgets').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('planner_vendors').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('planner_events').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('planner_food_drinks').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('planner_honeymoon_items').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('seating_tables').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
        safeCount(db.from('wedding_collaborators').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)),
    ]);

    return {
        guestEmailCount,
        userTriggeredEmailsUsed,
        tasks,
        budgets,
        vendors,
        events,
        foodDrinks,
        honeymoonItems,
        seatingTables,
        collaborators,
    };
}

export async function logPlannerEmailEvent(db: any, input: {
    weddingId: string;
    eventType: PlannerEmailEventType;
    recipientCount: number;
    successCount: number;
    userId?: string | null;
}) {
    if (input.recipientCount <= 0) return;

    const result = await db.from('planner_email_events').insert({
        wedding_id: input.weddingId,
        event_type: input.eventType,
        recipient_count: input.recipientCount,
        success_count: input.successCount,
        created_by_user_id: input.userId || null,
    });

    if (result.error && !isSchemaMissingError(result.error)) {
        throw result.error;
    }
}
