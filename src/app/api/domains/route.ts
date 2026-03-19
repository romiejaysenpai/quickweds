import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { domain } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
            return NextResponse.json({ error: 'Vercel API keys are not configured in environment.' }, { status: 500 });
        }

        const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: domain }),
        });

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add domain to Vercel' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = searchParams.get('domain');

        if (!domain) return NextResponse.json({ error: 'Domain is required' }, { status: 400 });

        if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
            return NextResponse.json({ error: 'Vercel API keys not configured.' }, { status: 500 });
        }

        const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/config`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch domain verification status' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) return NextResponse.json({ error: 'Domain query param is required' }, { status: 400 });

    if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_TOKEN) {
        return NextResponse.json({ error: 'Vercel API keys not configured.' }, { status: 500 });
    }

    try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to delete custom domain from Vercel.' }, { status: 500 });
    }
}
