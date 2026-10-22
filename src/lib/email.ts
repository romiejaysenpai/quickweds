import { createHash } from 'crypto';
import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { getUserTriggeredEmailUsage } from '@/lib/planner-limits';
import { render } from '@react-email/render';
import { claimEmailDelivery, finishEmailDelivery, type EmailTracking, type DeliveryClaim } from '@/lib/email-delivery';
import {
    getGuestConfirmationHtml,
    getCoupleNotificationHtml,
    getThankYouNoteHtml,
    getCollaboratorInviteHtml,
    getMarketingNurtureEmail,
    getMarketingNurtureStepCount,
} from './email-templates';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuickWeds <noreply@rsvp.quickweds.site>';

let resendClient: Resend | null = null;

function getResendClient() {
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) return null;
    if (!resendClient) resendClient = new Resend(resendApiKey);
    return resendClient;
}

interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    contentId?: string;
}

interface SendEmailParams {
    tracking?: EmailTracking;
    idempotencyKey?: string;
    to: string | string[];
    subject?: string;
    html?: string;
    react?: ReactElement;
    template?: {
        id: string;
        variables: Record<string, string | number>;
    };
    attachments?: EmailAttachment[];
    tags?: { name: string; value: string }[];
}

export async function sendEmail({ to, subject, html, react, template, attachments, tags, tracking, idempotencyKey }: SendEmailParams) {
    const resend = getResendClient();
    if (!resend) {
        console.error('Email configuration missing. Set RESEND_API_KEY before sending.');
        return { success: false, error: 'Email configuration missing' };
    }

    const recipientList = Array.isArray(to) ? to : [to];
    const validRecipients = recipientList
        .map((recipient) => String(recipient || '').trim())
        .filter((recipient) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient));

    if (validRecipients.length === 0) {
        return { success: false, error: 'No valid email recipients provided' };
    }

    let delivery: DeliveryClaim | undefined;
    try {
        console.log(`Attempting to send email via Resend to ${validRecipients.length} recipient(s).`);

        if (!html && !react && !template?.id) {
            throw new Error('HTML, React Email component, or template ID is required for email sending');
        }

        let payload: any = {
            from: FROM_EMAIL,
            to: validRecipients,
            ...(subject ? { subject } : {}),
            ...(template?.id
                ? { template: { id: template.id, variables: template.variables } }
                : react
                    ? { react }
                    : { html: html || '' }),
            ...(attachments && attachments.length > 0 ? { attachments } : {}),
            ...(tags && tags.length > 0 ? { tags } : {}),
        };

        if (tracking) {
            if (react) { payload.html = await render(react); delete payload.react; }
            if (attachments?.length || template) throw new Error('Tracked sends require frozen HTML without attachments or hosted templates.');
            delivery = await claimEmailDelivery(tracking, payload);
            if (delivery.state === 'accepted') return { success: true, id: delivery.provider_id, alreadyAccepted: true };
            if (delivery.state !== 'processing') return { success: false, error: delivery.state === 'limited' ? 'Guest email allowance reached.' : `Email is ${delivery.state}. Retry the same operation later.`, retryable: delivery.state === 'busy' };
            payload = { ...delivery.payload, tags: [...((delivery.payload.tags as Array<{name:string;value:string}>) || []), { name: 'quickweds_delivery', value: delivery.id }] };
            idempotencyKey = `quickweds/${delivery.id}`;
        }
        if(!tracking && !idempotencyKey){
            if(react){payload.html=await render(react);delete payload.react;}
            idempotencyKey=`quickweds/message/${createHash('sha256').update(JSON.stringify(payload)).digest('hex')}/${Math.floor(Date.now()/300000)}`;
        }
        const { data, error } = await resend.emails.send(payload, idempotencyKey ? { idempotencyKey } : undefined);

        if (error) {
            if (delivery) {
                const status = Number((error as { statusCode?: number }).statusCode || 0);
                await finishEmailDelivery(delivery, status >= 400 && status < 500 && ![408,409,425,429].includes(status) ? 'failed' : 'retryable', undefined, error.message);
                delivery = undefined;
            }
            console.error('Resend API error:', error);
            return {
                success: false,
                error: error.message || 'Resend request failed',
                details: error,
            };
        }

        if (!data?.id) throw new Error('Email provider did not confirm acceptance. Retry the same operation.');
        if (delivery) { await finishEmailDelivery(delivery, 'accepted', data.id); delivery = undefined; }
        console.log(`Resend accepted the email request. ID: ${data?.id || 'n/a'}`);
        return {
            success: true,
            id: data?.id,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown email error';
        if (delivery) {
            try { await finishEmailDelivery(delivery, 'retryable', undefined, message); }
            catch { console.error('Email delivery requires reconciliation.'); }
        }
        console.error('Unexpected Resend email send exception:', err);
        return { success: false, error: message };
    }
}

/** Materialize the complete recipient snapshot before attempting bounded sends. */
export async function queueEmailBatch(items: Array<{tracking: EmailTracking;to:string;subject:string;html:string}>) {
 const db=(await import('@/lib/supabase-admin')).getSupabaseAdminClient() as any;
 const jobs:DeliveryClaim[]=[];
 for(let offset=0;offset<items.length;offset+=1000){
  const rows=items.slice(offset,offset+1000).map(item=>({key:createHash('sha256').update(item.tracking.key).digest('hex'),wedding_id:item.tracking.weddingId,guard:item.tracking.guard,quota_limit:item.tracking.quotaLimit??null,payload:{from:FROM_EMAIL,to:[item.to],subject:item.subject,html:item.html}}));
  const {data,error}=await db.rpc('quickweds_enqueue_email_batch',{p_rows:rows});if(error)throw error;jobs.push(...(data||[]));
 }
 return jobs;
}

/** Retries only a stored, authenticated wedding operation with its original payload and key. */
export async function retryStoredEmail(job: DeliveryClaim) {
    const client=getResendClient();if(!client)throw new Error('Email configuration missing.');
    const db = (await import('@/lib/supabase-admin')).getSupabaseAdminClient() as any;
    if (!job.recoverable || !job.wedding_id || !job.delivery_guard) throw new Error('This email cannot be retried from the planner.');
    const guard = job.delivery_guard;
    const allowed = (guard.table === 'rsvps' && guard.emailField === 'guest_email') || (['wedding_collaborators','entourage_invitations'].includes(guard.table) && guard.emailField === 'email');
    if (!allowed) throw new Error('Invalid delivery context.');
    const {data: recipient,error: recipientError} = await db.from(guard.table).select('*').eq('id',guard.id).eq('wedding_id',job.wedding_id).maybeSingle();
    if(recipientError)throw recipientError;
    const recipients = job.payload.to as string[];
    if(!recipient || recipients.length !== 1 || String(recipient[guard.emailField] || '').toLowerCase() !== recipients[0].toLowerCase() || (guard.tokenHash && recipient.token_hash !== guard.tokenHash)) throw new Error('The invitation or recipient changed. Start a new operation from its original planning tool.');
    if(guard.table==='wedding_collaborators' && recipient.status!=='pending')throw new Error('This collaboration invitation no longer needs sending.');
    const {data:claim,error}=await db.rpc('quickweds_claim_email',{p_key:job.semantic_key,p_payload:job.payload,p_wedding:job.wedding_id,p_limit:job.quota_limit ?? null,p_baseline:job.quota_limit != null ? await getUserTriggeredEmailUsage(db,job.wedding_id) : 0,p_guard:guard,p_recoverable:true});
    if(error)throw error;
    if(claim.state==='accepted')return {success:true,alreadyAccepted:true,id:claim.provider_id};
    if(claim.state!=='processing')return {success:false,error:`Email is ${claim.state}.`};
    try {
      const payload={...claim.payload,tags:[...(claim.payload.tags||[]),{name:'quickweds_delivery',value:claim.id}]};
      const result=await client.emails.send(payload as Parameters<typeof client.emails.send>[0],{idempotencyKey:`quickweds/${claim.id}`});
      if(result.error){const status=Number(result.error.statusCode||0);await finishEmailDelivery(claim,status>=400&&status<500&&![408,409,425,429].includes(status)?'failed':'retryable',undefined,result.error.message);return {success:false,error:result.error.message};}
      if(!result.data?.id)throw new Error('Provider acceptance is uncertain.');
      await finishEmailDelivery(claim,'accepted',result.data.id);return {success:true,id:result.data.id};
    }catch(reason){await finishEmailDelivery(claim,'retryable',undefined,reason instanceof Error?reason.message:'Retry failed');throw reason;}
}

/** A provider receipt must identify this exact job; users cannot assert delivery themselves. */
export async function verifyStoredEmailReceipt(job: DeliveryClaim, providerId: string) {
    const client=getResendClient();if(!client)throw new Error('Email configuration missing.');
    const {data,error}=await client.emails.get(providerId);
    if(error||!data)throw new Error('Unable to verify this provider receipt.');
    const recipients=(value:unknown)=>JSON.stringify((Array.isArray(value)?value:[]).map(item=>String(item).trim().toLowerCase()).sort());
    if(data.id!==providerId || recipients(data.to)!==recipients(job.payload.to) || data.subject!==job.payload.subject || data.html!==job.payload.html || !data.tags?.some(tag=>tag.name==='quickweds_delivery'&&tag.value===job.id) || ['scheduled','canceled'].includes(data.last_event)) throw new Error('This provider receipt does not match the stored delivery.');
    return providerId;
}

export {
    getGuestConfirmationHtml,
    getCoupleNotificationHtml,
    getThankYouNoteHtml,
    getCollaboratorInviteHtml,
    getMarketingNurtureEmail,
    getMarketingNurtureStepCount,
};
