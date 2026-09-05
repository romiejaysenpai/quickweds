import {NextRequest,NextResponse} from 'next/server';
import QRCode from 'qrcode';
import {getAppBaseUrl} from '@/lib/seat-finder';
export async function GET(req:NextRequest){
    const token=req.nextUrl.searchParams.get('token')||'';
    if(!/^[\w-]{20,200}$/.test(token))return new NextResponse(null,{status:400});
    const image=await QRCode.toBuffer(`${getAppBaseUrl(req.url)}/guest/${token}`,{width:240,margin:2});
    return new NextResponse(new Uint8Array(image),{headers:{'Content-Type':'image/png','Cache-Control':'private, max-age=3600','Referrer-Policy':'no-referrer'}});
}
