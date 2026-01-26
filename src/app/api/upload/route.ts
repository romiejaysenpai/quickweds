import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fileName, fileType, userId, weddingId, folder } = body;

        if (!fileName || !fileType || !userId || !weddingId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const bucket = storage.bucket();
        const cleanFileName = `${folder || 'uploads'}-${fileName.replace(/\s+/g, '_')}`;
        const filePath = `quickweds/${userId}/${weddingId}/${cleanFileName}`;
        const file = bucket.file(filePath);

        // Generate a signed URL for a direct PUT upload
        // This allows the client to upload files larger than 4.5MB (Vercel limit)
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: fileType,
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        return NextResponse.json({
            success: true,
            uploadUrl: url,
            publicUrl: publicUrl
        });
    } catch (error: any) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
