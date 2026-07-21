import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getRequestUser } from '@/lib/api-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { hasAccountPro } from '@/lib/account';
import { isKnownAdminEmail } from '@/lib/admin';

export const runtime = 'nodejs';

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

function uploadVideo(buffer: Buffer, userId: string) {
    return new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            resource_type: 'video',
            folder: `monogram_exports/${userId}`,
            format: 'webm',
            eager: [{ format: 'mp4', video_codec: 'h264' }],
            eager_async: false,
            overwrite: false,
        }, (error, result) => error || !result ? reject(error || new Error('Video export failed.')) : resolve(result)).end(buffer);
    });
}

export async function POST(request: NextRequest) {
    if (!process.env.CLOUDINARY_URL) {
        return NextResponse.json({ error: 'MP4 export is not configured yet. Please try again later.' }, { status: 503 });
    }

    try {
        const { user, error } = await getRequestUser(request);
        if (!user) return NextResponse.json({ error: error || 'Please sign in to export your monogram.' }, { status: 401 });

        const db = getSupabaseAdminClient() as any;
        const { data: profile } = await db
            .from('user_app_profiles')
            .select('is_pro, payment_status')
            .eq('user_id', user.id)
            .maybeSingle();
        if (!hasAccountPro(profile) && !isKnownAdminEmail(user.email)) {
            return NextResponse.json({ error: 'MP4 monogram exports are available with Account Pro.' }, { status: 403 });
        }

        const form = await request.formData();
        const file = form.get('video');
        if (!(file instanceof File) || file.size === 0 || file.size > MAX_VIDEO_BYTES || !file.type.startsWith('video/')) {
            return NextResponse.json({ error: 'Please upload a short monogram video under 20 MB.' }, { status: 400 });
        }

        cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
        const result = await uploadVideo(Buffer.from(await file.arrayBuffer()), user.id);
        const mp4Url = result.eager?.find((asset: { format?: string }) => asset.format === 'mp4')?.secure_url;
        if (!mp4Url) throw new Error('MP4 transcoding did not complete.');

        return NextResponse.json({ url: mp4Url });
    } catch (error) {
        console.error('Monogram MP4 export failed:', error);
        return NextResponse.json({ error: 'Unable to create your MP4 export. Please try again.' }, { status: 500 });
    }
}
