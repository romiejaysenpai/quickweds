import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { checked, allRows } from '@/lib/operations-server';
export async function GET(req: NextRequest) {
    const { user } = await getRequestUser(req);
    if (!user) return NextResponse.json({error:'Please sign in.'},{status:401});
    try {
        const db = getSupabaseAdminClient() as any;
        const shared = checked(await db.from('wedding_collaborators').select('wedding_id').eq('email',user.email?.toLowerCase() || '').eq('status','accepted').in('role',['partner','coordinator'])).data || [];
        const [owned, invited] = await Promise.all([
            db.from('weddings').select('id,bride_name,groom_name,wedding_date,archived_at').eq('user_id',user.id).is('deleted_at',null),
            shared.length ? db.from('weddings').select('id,bride_name,groom_name,wedding_date,archived_at').in('id',shared.map((item:any)=>item.wedding_id)).is('deleted_at',null) : Promise.resolve({data:[],error:null}),
        ]);
        checked(owned); checked(invited);
        const weddings = [...new Map<string,any>([...owned.data,...invited.data].map((w:any)=>[w.id,w])).values()].filter(w=>!w.archived_at);
        if (!weddings.length) return NextResponse.json({weddings:[],attention:[]});
        const ids = weddings.map(w=>w.id);
        const results = await Promise.all([
            db.from('wedding_operations').select('id,wedding_id,title,kind,due_at,status').in('wedding_id',ids).eq('status','pending'),
            db.from('wedding_deliveries').select('id,wedding_id,recipient,last_error').in('wedding_id',ids).eq('status','failed'),
            db.from('planner_tasks').select('id,wedding_id,title,due_date,status').in('wedding_id',ids).neq('status','completed').not('due_date','is',null),
            allRows(()=>db.from('rsvps').select('id,wedding_id,rsvp_status,table_assignment').in('wedding_id',ids)),
        ]);
        results.forEach(checked);
        const attention = [
            ...results[0].data.map((item:any)=>({...item,label:item.title})),
            ...results[1].data.map((item:any)=>({...item,kind:'delivery',label:`Email failed: ${item.recipient}`})),
            ...results[2].data.filter((item:any)=>new Date(item.due_date).getTime()<Date.now()+7*86400000).map((item:any)=>({...item,due_at:item.due_date,kind:'checklist',label:item.title})),
            ...weddings.flatMap(w=> {
                const guests=results[3].data.filter((g:any)=>g.wedding_id===w.id);
                const pending=guests.filter((g:any)=>g.rsvp_status==='pending').length;
                const unseated=guests.filter((g:any)=>g.rsvp_status==='confirmed'&&!g.table_assignment).length;
                return [{id:`${w.id}-rsvp`,wedding_id:w.id,kind:'guests',label:`${pending} households awaiting RSVP`,count:pending},{id:`${w.id}-seats`,wedding_id:w.id,kind:'seating',label:`${unseated} confirmed parties without tables`,count:unseated}].filter(item=>item.count);
            }),
        ].sort((a:any,b:any)=>(a.kind==='delivery'?-1:b.kind==='delivery'?1:0)||String(a.due_at||'9999').localeCompare(String(b.due_at||'9999')));
        return NextResponse.json({weddings,attention},{headers:{'Cache-Control':'no-store'}});
    } catch(error) {return NextResponse.json({error:error instanceof Error ? error.message:'Unable to load portfolio.'},{status:400});}
}
