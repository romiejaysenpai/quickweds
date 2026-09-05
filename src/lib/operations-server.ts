import 'server-only';
import { NextRequest } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getWeddingAccess } from '@/lib/wedding-access';
export async function operationAccess(req: NextRequest, weddingId: string) {
    const { user } = await getRequestUser(req);
    if (!user) throw new Error('Please sign in.');
    const db = getSupabaseAdminClient() as any;
    const access = await getWeddingAccess(db, user, weddingId, { select: '*' });
    if (!access.canManage || access.wedding.deleted_at) throw new Error('Wedding access denied.');
    return { db, user, wedding: access.wedding, role: access.role };
}
export function checked<T extends { error?: { message: string } | null }>(result: T): T {
    if (result.error) throw new Error(result.error.message);
    return result;
}
export async function allRows(query:()=>any){
    const data:any[]=[];
    for(let offset=0;offset<100000;offset+=1000){const result=checked(await query().order('id').range(offset,offset+999));data.push(...result.data);if(result.data.length<1000)return {data,error:null};}
    throw new Error('This workspace is too large to load safely. Please narrow the requested weddings.');
}
