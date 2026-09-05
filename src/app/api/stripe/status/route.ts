import {NextRequest,NextResponse} from 'next/server';
import {getRequestUser} from '@/lib/api-auth';
import {getStripe} from '@/lib/stripe';
import {getSupabaseAdminClient} from '@/lib/supabase-admin';
export async function GET(req:NextRequest){
    const {user}=await getRequestUser(req);if(!user)return new NextResponse(null,{status:401});
    const id=req.nextUrl.searchParams.get('sessionId')||'';if(!/^cs_[\w]+$/.test(id))return NextResponse.json({status:'processing'});
    try{const session=await getStripe().checkout.sessions.retrieve(id);if(session.metadata?.userId!==user.id)return new NextResponse(null,{status:403});const db=getSupabaseAdminClient() as any;let unlocked=false;
    if(session.payment_status==='paid'){const result=session.metadata.scope==='account'?await db.from('user_app_profiles').select('is_pro').eq('user_id',user.id).maybeSingle():await db.from('weddings').select('is_premium').eq('id',session.metadata.weddingId).maybeSingle();unlocked=Boolean(result.data?.is_pro||result.data?.is_premium);}
    return NextResponse.json({status:unlocked?'paid':session.status==='expired'?'failed':'processing'},{headers:{'Cache-Control':'no-store'}});
    }catch{return NextResponse.json({status:'processing'},{status:503});}
}
