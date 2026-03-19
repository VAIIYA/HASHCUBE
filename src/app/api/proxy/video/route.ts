import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) return new Response('Missing url', { status: 400 });

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://twitter.com/',
            },
        });

        if (!response.ok) {
            return new Response(`Failed to fetch video: ${response.statusText}`, { status: response.status });
        }

        const headers = new Headers();
        // Forward relevant headers
        if (response.headers.has('Content-Type')) headers.set('Content-Type', response.headers.get('Content-Type')!);
        if (response.headers.has('Content-Length')) headers.set('Content-Length', response.headers.get('Content-Length')!);
        if (response.headers.has('Accept-Ranges')) headers.set('Accept-Ranges', response.headers.get('Accept-Ranges')!);

        headers.set('Cache-Control', 'public, max-age=3600');

        // Return the body as a stream
        return new Response(response.body, {
            status: 200,
            headers,
        });
    } catch (e) {
        console.error('Proxy error:', e);
        return new Response('Proxy error', { status: 500 });
    }
}
