'use client';
import {useState} from 'react';
import {supabase} from '@/lib/supabase';
import {compressImageForUpload} from '@/lib/image-compression';
type Item={id:string;file:File;state:'ready'|'uploading'|'saved'|'failed';error?:string;intentId?:string};
export default function GuestPhotoBatch({weddingId,code,name}:{weddingId:string;code:string;name:string}){
    const [items,setItems]=useState<Item[]>([]);const [busy,setBusy]=useState(false);
    const update=(id:string,patch:Partial<Item>)=>setItems(current=>current.map(item=>item.id===id?{...item,...patch}:item));
    async function upload(){setBusy(true);for(const item of items.filter(item=>item.state!=='saved')){update(item.id,{state:'uploading',error:undefined});try{
        let intentId=item.intentId;
        if(!intentId){const file=await compressImageForUpload(item.file);const response=await fetch('/api/public/photos/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:'prepare',weddingId,code,uploaderName:name,file:{name:file.name,type:file.type,size:file.size},guestIdentifier:code})});const prepared=await response.json();if(!response.ok)throw new Error(prepared.error);const {error}=await supabase.storage.from(prepared.bucket).uploadToSignedUrl(prepared.path,prepared.token,file,{contentType:file.type});if(error)throw error;intentId=prepared.intentId;update(item.id,{intentId});}
        const response=await fetch('/api/public/photos/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:'complete',intentId})});const result=await response.json();if(!response.ok)throw new Error(result.error);update(item.id,{state:'saved'});
    }catch(error){update(item.id,{state:'failed',error:error instanceof Error?error.message:'Upload failed. Retry this photo.'});}}setBusy(false);}
    return <section className="my-5 rounded-2xl border bg-white p-4 space-y-3"><h2 className="text-xl font-bold">Share several photos</h2><p>Photos are marked received when saved. The couple may review them before they appear in the album. Your sharing-code limit still applies.</p><input aria-label="Choose photos to share" disabled={busy||!code} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={e=>{const files=Array.from(e.target.files||[]);setItems(current=>[...current,...files.slice(0,20-current.length).map(file=>({id:crypto.randomUUID(),file,state:'ready' as const}))]);e.target.value='';}}/>{items.map(item=><p key={item.id} role="status">{item.file.name}: {item.state==='saved'?'Received':item.state}{item.error?` — ${item.error}`:''}</p>)}<button disabled={busy||!code||!items.some(item=>item.state!=='saved')} className="min-h-12 rounded-xl bg-primary px-5 text-white disabled:opacity-50" onClick={()=>void upload()}>{busy?'Uploading…':'Upload / retry unfinished photos'}</button><p className="text-sm">Keep this page open until uploads finish. Saved photos are not sent again.</p></section>;
}
