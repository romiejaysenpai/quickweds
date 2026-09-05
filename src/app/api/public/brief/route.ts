import {createHash} from 'crypto';
import {NextRequest,NextResponse} from 'next/server';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';
import {createRateLimitMiddleware,getClientIP} from '@/lib/rate-limit';
async function context(req:NextRequest,token:string) {
    const limited=await createRateLimitMiddleware('SEAT_LOOKUP').check(`${getClientIP(req)}:brief`);
    if(limited.limited) throw new Error('Please wait before trying again.');
    if(!/^[\w-]{40,100}$/.test(token)) throw new Error('Brief unavailable.');
    const db=getSupabaseAdminClient() as any;
    const {data:item,error}=await db.from('wedding_operations').select('*').eq('token_hash',createHash('sha256').update(token).digest('hex')).in('kind',['vendor_brief','helper']).neq('status','cancelled').maybeSingle();
    if(error||!item) throw new Error('Brief unavailable.');
    if(item.kind==='helper'&&(!item.due_at||new Date(item.due_at).getTime()<Date.now())) throw new Error('Helper access has expired.');
    const {data:wedding}=await db.from('weddings').select('id,bride_name,groom_name,wedding_date,venue_name,venue_address,contact_person,deleted_at,completed_at').eq('id',item.wedding_id).maybeSingle();
    if(!wedding||wedding.deleted_at||(item.kind==='helper'&&wedding.completed_at)) throw new Error('Brief unavailable.');
    return {db,item,wedding};
}
export async function GET(req:NextRequest) {
    try {
        const {db,item,wedding}=await context(req,req.nextUrl.searchParams.get('token')||'');
        let guests=[];
        if(item.kind==='helper') {
            const result=await db.from('rsvps').select('id,guest_name,guest_code,table_assignment,checked_in_at,num_guests').eq('wedding_id',item.wedding_id).eq('rsvp_status','confirmed');
            if(result.error) throw new Error('Guest list unavailable.');
            guests=result.data;
        }
        return NextResponse.json({item:{title:item.title,kind:item.kind,status:item.status,due_at:item.due_at,version:item.version,notes:item.data.notes},wedding,guests},{headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
    }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Brief unavailable.'},{status:403});}
}
export async function POST(req:NextRequest) {
    try {
        const body=await req.json();
        const {db,item}=await context(req,String(body.token||''));
        if(item.kind==='helper') {
            if(typeof body.guestId!=='string') throw new Error('Choose a guest.');
            const {error,data}=await db.from('rsvps').update({checked_in_at:new Date().toISOString()}).eq('id',body.guestId).eq('wedding_id',item.wedding_id).eq('rsvp_status','confirmed').is('checked_in_at',null).select('id');
            if(error) throw new Error('Unable to check in guest.');
            return NextResponse.json({success:true,alreadyCheckedIn:!data?.length});
        }
        if(body.version!==item.version) throw new Error('This briefing changed. Refresh and review it again.');
        const {error}=await db.from('wedding_operations').update({status:'done',updated_at:new Date().toISOString()}).eq('id',item.id).eq('version',item.version);
        if(error) throw new Error('Unable to acknowledge.');
        return NextResponse.json({success:true});
    }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to save.'},{status:400});}
}
