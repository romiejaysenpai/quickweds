import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;
        const weddingId = formData.get('weddingId') as string;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file || !userId || !weddingId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${folder}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = `quickweds/${userId}/${weddingId}/${filename}`;

        const bucket = storage.bucket();
        const fileUpload = bucket.file(filePath);

        await fileUpload.save(buffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // Make the file publicly accessible (optional, depends on security needs)
        // For wedding invites, usually they are public
        await fileUpload.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
