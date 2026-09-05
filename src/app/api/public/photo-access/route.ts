import {createHash} from 'crypto';
import {NextRequest,NextResponse} from 'next/server';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';
import {createRateLimitMiddleware,getClientIP} from '@/lib/rate-limit';
export async function POST(req:NextRequest){
    const limited=await createRateLimitMiddleware('PHOTO_UPLOAD').check(`${getClientIP(req)}:photo-access`);if(limited.limited)return limited.response;
    const {token}=await req.json().catch(()=>({}));if(typeof token!=='string'||!/^[\w-]{20,200}$/.test(token))return NextResponse.json({error:'Guest pass unavailable.'},{status:404});
    const db=getSupabaseAdminClient() as any;
    const {data:guest}=await db.from('rsvps').select('wedding_id,guest_name').eq('seat_lookup_token',token).maybeSingle();
    if(!guest)return NextResponse.json({error:'Guest pass unavailable.'},{status:404});
    const {data:wedding}=await db.from('weddings').select('id').eq('id',guest.wedding_id).eq('is_published',true).is('deleted_at',null).maybeSingle();
    if(!wedding)return NextResponse.json({error:'Photo sharing unavailable.'},{status:404});
    const code=createHash('sha256').update(`photos:${token}`).digest('hex').slice(0,16).toUpperCase();
    const existing=await db.from('photo_sharing_codes').select('code,is_active').eq('wedding_id',wedding.id).eq('code',code).maybeSingle();
    if(existing.error)return NextResponse.json({error:'Photo access unavailable.'},{status:503});
    if(existing.data?.is_active===false)return NextResponse.json({error:'Photo access was disabled. Please contact the couple.'},{status:403});
    if(!existing.data){const result=await db.from('photo_sharing_codes').insert({wedding_id:wedding.id,code,is_active:true,max_uploads:3});if(result.error&&result.error.code!=='23505')return NextResponse.json({error:'Photo access unavailable.'},{status:503});}
    return NextResponse.json({code,name:guest.guest_name,weddingId:wedding.id},{headers:{'Cache-Control':'no-store'}});
}
