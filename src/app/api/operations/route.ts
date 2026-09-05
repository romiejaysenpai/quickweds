import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { operationAccess, checked, allRows } from '@/lib/operations-server';
import {getConfirmedThankYouRecipients,getSentThankYouLogState,filterUnsentThankYouRecipients} from '@/lib/thank-you-server';
import {invalidateWeddingPublicCache} from '@/lib/public-wedding';
import { makeGuestCode, makeSeatLookupToken, escapeHtml, getAppBaseUrl } from '@/lib/seat-finder';
import { eventInstant } from '@/lib/event-time';
import { getUserTriggeredEmailUsage, FREE_PLAN_LIMITS, hasPlannerProAccess } from '@/lib/planner-limits';

const schema = z.object({
    weddingId: z.string().min(1).max(200), action: z.enum(['create','update','invitations','schedule','settings','complete','rebase','rebase_apply','playbook_save','playbook_apply','link_expense','cancel_delivery']),
    id: z.string().uuid().optional(), version: z.number().int().optional(),
    kind: z.enum(['task','vendor_brief','payment','incident','helper','closeout']).optional(),
    title: z.string().min(1).max(300).optional(), ownerEmail: z.string().email().or(z.literal('')).optional(),
    dueAt: z.string().datetime().nullable().optional(), status: z.enum(['pending','done','cancelled']).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
});
export async function GET(req: NextRequest) {
    try {
        const { db, wedding } = await operationAccess(req, req.nextUrl.searchParams.get('weddingId') || '');
        const results = await Promise.all([
            db.from('wedding_operations').select('*').eq('wedding_id', wedding.id).order('due_at'),
            db.from('wedding_deliveries').select('id,recipient,kind,status,attempts,due_at,last_error').eq('wedding_id', wedding.id).order('due_at'),
            allRows(()=>db.from('rsvps').select('*').eq('wedding_id', wedding.id)),
            db.from('planner_vendors').select('*').eq('wedding_id', wedding.id),
            db.from('planner_tasks').select('*').eq('wedding_id', wedding.id),
            db.from('seating_assignments').select('*').eq('wedding_id', wedding.id),
            db.from('seating_tables').select('*').eq('wedding_id', wedding.id),
            db.from('planner_budgets').select('*').eq('wedding_id', wedding.id),
        ]);
        results.forEach(checked);
        const recipients=await getConfirmedThankYouRecipients(db,wedding.id);const sent=await getSentThankYouLogState(db,wedding.id);const thankYouUnsent=filterUnsentThankYouRecipients(recipients,sent);
        return NextResponse.json({ wedding, thankYouUnsent:thankYouUnsent.map(guest=>({id:guest.id,name:guest.guest_name})), items: results[0].data, deliveries: results[1].data, guests: results[2].data, vendors: results[3].data, tasks: results[4].data, assignments: results[5].data, tables: results[6].data, budgets:results[7].data, generatedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load operations.' }, { status: 400 }); }
}
export async function POST(req: NextRequest) {
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'Check the entered details.' }, { status: 400 });
    try {
        const input = parsed.data;
        const { db, user, wedding, role } = await operationAccess(req, input.weddingId);
        const data = input.data || {};
        if (input.action === 'settings') {
            const timeZone = z.string().max(100).parse(data.timeZone);
            new Intl.DateTimeFormat('en', { timeZone }).format();
            const embedOrigins = data.embedOrigins === undefined ? wedding.operations_settings?.embedOrigins || [] : z.array(z.string().url()).max(10).parse(data.embedOrigins).map(value => { const url = new URL(value); if(url.protocol !== 'https:' || url.username || url.password) throw new Error('Embedding requires an HTTPS website origin.'); return url.origin; });
            checked(await db.from('weddings').update({ event_timezone: timeZone, operations_settings: {...wedding.operations_settings,embedOrigins} }).eq('id', wedding.id));
        } else if (input.action === 'create') {
            if (!input.kind || !input.title) throw new Error('Choose a type and enter a title.');
            if (input.kind === 'helper' && !['owner','admin','partner'].includes(role || '')) throw new Error('Only the couple can authorize helper access.');
            if (input.kind === 'payment') {
                const vendorId = z.string().uuid().parse(data.vendorId);
                const amount = z.number().positive().max(100000000).parse(data.amount);
                // A receipt entry and recalculation are one database transaction.
                const payment = checked(await db.rpc('qw_record_payment', { p_wedding: wedding.id, p_vendor: vendorId, p_amount: amount, p_title: input.title, p_user: user.id, p_key: z.string().uuid().parse(data.requestId) }));
                return NextResponse.json({ success: true, payment: payment.data });
            }
            const publicAction = input.kind === 'vendor_brief' || input.kind === 'helper';
            if (input.kind === 'helper' && !input.dueAt) throw new Error('Choose when helper access expires.');
            const token = publicAction ? randomBytes(32).toString('base64url') : '';
            const item = checked(await db.from('wedding_operations').insert({ wedding_id: wedding.id, kind: input.kind, title: input.title, owner_email: input.ownerEmail || null, due_at: input.dueAt || null, data: { notes: String(data.notes || '').slice(0,10000) }, token_hash: token ? createHash('sha256').update(token).digest('hex') : null, created_by: user.id }).select('id').single());
            if(data.notifyOwner===true&&input.ownerEmail){
                const link=token?`${getAppBaseUrl(req.url)}/brief/${token}`:`${getAppBaseUrl(req.url)}/dashboard/${wedding.id}/operations`;
                checked(await db.from('wedding_deliveries').insert({wedding_id:wedding.id,recipient:input.ownerEmail,kind:input.kind,dedupe_key:`owner/${item.data.id}/1`,due_at:input.kind==='task'&&input.dueAt?input.dueAt:new Date().toISOString(),payload:{itemId:item.data.id,subject:input.title,html:`<p>${escapeHtml(input.title)}</p><p>${escapeHtml(String(data.notes||''))}</p><p><a href="${link}">Review your wedding action</a></p>`}}));
            }
            return NextResponse.json({ success: true, id: item.data.id, link: token ? `/brief/${token}` : undefined });
        } else if (input.action === 'update') {
            if (!input.id || !input.version || !input.status) throw new Error('Refresh before updating.');
            const item = checked(await db.from('wedding_operations').update({ status: input.status, version: input.version + 1, updated_at: new Date().toISOString() }).eq('id', input.id).eq('wedding_id', wedding.id).eq('version', input.version).neq('kind','payment').select('id').maybeSingle());
            if (!item.data) throw new Error('This item changed. Refresh and try again.');
        } else if (input.action === 'invitations') {
            const guests = checked(await db.from('rsvps').select('*').eq('wedding_id', wedding.id)).data || [];
            const links = [];
            for (const guest of guests) {
                let token = guest.seat_lookup_token;
                if (!token) {
                    token = makeSeatLookupToken();
                    checked(await db.from('rsvps').update({ seat_lookup_token: token, guest_code: guest.guest_code || makeGuestCode(guest.guest_name), invited_party_size: Math.max(Number(guest.num_guests) || 1, guest.plus_one_allowed ? 2 : 1) }).eq('id', guest.id).is('seat_lookup_token', null));
                    token = checked(await db.from('rsvps').select('seat_lookup_token').eq('id',guest.id).single()).data.seat_lookup_token;
                }
                links.push({ name: guest.guest_name, url: `${getAppBaseUrl(req.url)}/guest/${token}` });
            }
            return NextResponse.json({ success: true, links });
        } else if (input.action === 'schedule') {
            if (!input.dueAt || new Date(input.dueAt).getTime() < Date.now()) throw new Error('Choose a future reminder time.');
            if (!wedding.is_published || wedding.completed_at) throw new Error('Reminders require a live, active wedding.');
            const guests = checked(await db.from('rsvps').select('id,guest_email,guest_name,seat_lookup_token').eq('wedding_id', wedding.id).eq('rsvp_status','pending')).data || [];
            const recipients = guests.filter((guest: any) => guest.guest_email && guest.seat_lookup_token);
            const profile = checked(await db.from('user_app_profiles').select('is_pro,payment_status').eq('user_id',wedding.user_id).maybeSingle()).data;
            const queued = checked(await db.from('wedding_deliveries').select('id',{ count: 'exact', head: true }).eq('wedding_id',wedding.id).in('status',['queued','processing','accepted','failed'])).count || 0;
            if (!hasPlannerProAccess({ wedding, accountProfile: profile }) && await getUserTriggeredEmailUsage(db,wedding.id) + queued + recipients.length > FREE_PLAN_LIMITS.userTriggeredEmails) throw new Error('This reminder exceeds your remaining outbound email allowance.');
            const rows = recipients.map((guest: any) => ({ wedding_id: wedding.id, recipient: guest.guest_email, kind: 'rsvp', dedupe_key: `rsvp/${guest.id}/${input.dueAt}`, due_at: input.dueAt, payload: { guestId: guest.id, subject: `RSVP: ${wedding.bride_name} & ${wedding.groom_name}`, html: `<p>Hello ${escapeHtml(guest.guest_name)}, please let us know if you can join us.</p><p><a href="${getAppBaseUrl(req.url)}/guest/${guest.seat_lookup_token}">View your invitation and reply</a></p>` } }));
            if (rows.length) checked(await db.from('wedding_deliveries').upsert(rows,{ onConflict: 'dedupe_key', ignoreDuplicates: true }));
            return NextResponse.json({ success: true, queued: rows.length });
        } else if(input.action==='cancel_delivery'){
            if(!input.id)throw new Error('Choose a delivery.');
            checked(await db.from('wedding_deliveries').update({status:'cancelled'}).eq('id',input.id).eq('wedding_id',wedding.id).in('status',['queued','failed']));
        } else if(input.action==='link_expense'){
            const budgetId=z.string().uuid().parse(data.budgetId);const vendorId=z.string().uuid().nullable().parse(data.vendorId);
            if(vendorId&&!checked(await db.from('planner_vendors').select('id').eq('id',vendorId).eq('wedding_id',wedding.id).maybeSingle()).data)throw new Error('Vendor unavailable.');
            checked(await db.from('planner_budgets').update({planner_vendor_id:vendorId}).eq('id',budgetId).eq('wedding_id',wedding.id));
        } else if(input.action==='rebase_apply'){
            const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(data.date);const ids=z.array(z.string().uuid()).max(500).parse(data.ids);const expected=z.string().parse(data.expectedDate);
            checked(await db.rpc('qw_rebase_tasks',{p_wedding:wedding.id,p_date:date,p_expected_date:expected,p_ids:ids}));
        } else if (input.action === 'complete') {
            checked(await db.from('weddings').update({ completed_at: new Date().toISOString(), is_thank_you_mode: true, archived_at: data.archive === true ? new Date().toISOString() : null }).eq('id',wedding.id));
            checked(await db.from('wedding_deliveries').update({status:'cancelled'}).eq('wedding_id',wedding.id).in('status',['queued','failed']));
            checked(await db.from('wedding_operations').update({status:'cancelled'}).eq('wedding_id',wedding.id).eq('kind','helper'));
            await db.from('product_events').insert({user_id:user.id,wedding_id:wedding.id,event:'closeout_completed'});
        } else if (input.action === 'playbook_save') {
            const tasks = checked(await db.from('planner_tasks').select('title,due_date').eq('wedding_id',wedding.id)).data || [];
            const anchor = eventInstant(wedding.wedding_date,wedding.wedding_time || '00:00',wedding.event_timezone).getTime();
            const templates = tasks.map((task:any)=>({title:task.title,offset:task.due_date ? Math.round((new Date(task.due_date).getTime()-anchor)/86400000) : null}));
            checked(await db.from('planning_playbooks').insert({user_id:user.id,name:input.title || 'Wedding checklist',tasks:templates}));
        } else if (input.action === 'playbook_apply') {
            const playbook = checked(await db.from('planning_playbooks').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data;
            if (!playbook) throw new Error('Save a checklist as a playbook first.');
            const anchor = eventInstant(wedding.wedding_date,wedding.wedding_time || '00:00',wedding.event_timezone).getTime();
            const existing = checked(await db.from('wedding_operations').select('title').eq('wedding_id',wedding.id).eq('kind','task')).data || [];
            const names = new Set(existing.map((item:any)=>item.title));
            const rows = playbook.tasks.filter((task:any)=>!names.has(task.title)).map((task:any)=>({wedding_id:wedding.id,kind:'task',title:task.title,due_at:task.offset == null ? null : new Date(anchor+task.offset*86400000).toISOString(),created_by:user.id,data:{playbookId:playbook.id}}));
            if(rows.length) checked(await db.from('wedding_operations').insert(rows));
        } else if (input.action === 'rebase') {
            // A preview is returned; dates are never silently moved.
            const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(data.date);
            const delta = eventInstant(date,wedding.wedding_time || '00:00',wedding.event_timezone).getTime()-eventInstant(wedding.wedding_date,wedding.wedding_time || '00:00',wedding.event_timezone).getTime();
            const tasks = checked(await db.from('wedding_operations').select('id,title,due_at').eq('wedding_id',wedding.id).eq('kind','task').eq('status','pending').not('due_at','is',null)).data || [];
            return NextResponse.json({ preview: tasks.map((task:any)=>({...task, proposed: new Date(new Date(task.due_at).getTime()+delta).toISOString()})), note:'Review fixed contractual dates before changing the wedding date.' });
        }
        if(['complete','settings','rebase_apply'].includes(input.action))await invalidateWeddingPublicCache(wedding.id,wedding.public_slug);
        return NextResponse.json({ success: true });
    } catch(error) { return NextResponse.json({error:error instanceof Error ? error.message : 'Unable to save.'},{status:400}); }
}
