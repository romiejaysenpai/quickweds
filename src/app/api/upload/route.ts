import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EXTENSIONS: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

async function uploadToCloudinary(file: File): Promise<string | null> {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) return null;

    cloudinary.config({ cloudinary_url: cloudinaryUrl });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'section_backgrounds',
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary section background upload error:', error);
                    resolve(null);
                } else {
                    resolve(result?.secure_url || null);
                }
            }
        ).end(buffer);
    });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Image file must be under 10MB' }, { status: 400 });
        }

        // 1. Try Supabase Storage first if admin client is configured
        try {
            const adminClient = getSupabaseAdminClient();
            const extension = EXTENSIONS[file.type] || 'jpg';
            const objectPath = `section-backgrounds/${Date.now()}_${randomBytes(8).toString('hex')}.${extension}`;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await adminClient.storage
                .from('quickweds')
                .upload(objectPath, buffer, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (!uploadError) {
                const { data: publicUrlData } = adminClient.storage.from('quickweds').getPublicUrl(objectPath);
                if (publicUrlData?.publicUrl) {
                    return NextResponse.json({ url: publicUrlData.publicUrl });
                }
            } else {
                console.warn('Supabase storage upload failed, falling back to Cloudinary if available:', uploadError.message);
            }
        } catch (supabaseErr: any) {
            console.warn('Supabase storage unavailable or unconfigured:', supabaseErr?.message);
        }

        // 2. Fallback to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file);
        if (cloudinaryUrl) {
            return NextResponse.json({ url: cloudinaryUrl });
        }

        // 3. If neither storage provider succeeded, return a clear error
        return NextResponse.json(
            { error: 'Image upload storage service is temporarily unavailable. Please check your network or try again.' },
            { status: 503 }
        );
    } catch (err: any) {
        console.error('Unhandled image upload error:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to process image upload' },
            { status: 500 }
        );
    }
}
