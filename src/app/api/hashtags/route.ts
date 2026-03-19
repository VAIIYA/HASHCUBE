import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

export async function GET() {
    try {
        const result = await turso.execute(`
            SELECT hashtags FROM links 
            WHERE hashtags IS NOT NULL AND hashtags != 'null'
        `);

        const hashtagCounts: Record<string, number> = {};

        result.rows.forEach(row => {
            try {
                const tags = JSON.parse(row.hashtags as string);
                if (Array.isArray(tags)) {
                    tags.forEach((tag: string) => {
                        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
                    });
                }
            } catch (e) {
                console.error('Error parsing hashtags:', e);
            }
        });

        const sortedHashtags = Object.entries(hashtagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json(sortedHashtags);
    } catch (error: any) {
        console.error('Fetch hashtags error:', error);
        return NextResponse.json({ error: 'Failed to fetch hashtags' }, { status: 500 });
    }
}
