import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Transform Odysee URL to embed URL
        // https://odysee.com/@Channel:c/Video:id -> https://odysee.com/$/embed/@Channel:c/Video:id
        let embedUrl = url;
        if (url.includes('odysee.com') && !url.includes('/$/embed/')) {
            embedUrl = url.replace('odysee.com/', 'odysee.com/$/embed/');
        }

        // Fetch the page to extract Open Graph metadata
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Odysee page');
        }

        const html = await response.text();

        // Simple regex to extract OG tags
        const getOgTag = (property: string) => {
            const regex = new RegExp(`<meta [^>]*property=["']og:${property}["'] [^>]*content=["']([^"']*)["']`, 'i');
            const match = html.match(regex);
            if (match) return match[1];
            
            // Try with name instead of property
            const nameRegex = new RegExp(`<meta [^>]*name=["']og:${property}["'] [^>]*content=["']([^"']*)["']`, 'i');
            const nameMatch = html.match(nameRegex);
            return nameMatch ? nameMatch[1] : '';
        };

        const title = getOgTag('title') || 'Odysee Video';
        const description = getOgTag('description') || '';
        const thumbnail = getOgTag('image') || '';

        return NextResponse.json({
            title,
            description,
            thumbnail_url: thumbnail,
            embed_url: embedUrl,
            html: `<iframe width="100%" height="400" src="${embedUrl}" frameBorder="0" allowFullScreen></iframe>`
        });

    } catch (error: any) {
        console.error('Odysee metadata fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch Odysee metadata' }, { status: 500 });
    }
}
