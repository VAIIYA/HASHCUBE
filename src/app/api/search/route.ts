import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');

    try {
        let sql = `SELECT * FROM links WHERE 1=1 `;
        let args: any[] = [];

        if (tag) {
            sql += `AND hashtags LIKE ? `;
            args.push(`%"${tag.toLowerCase()}"%`);
        } else if (query) {
            sql += `AND (title LIKE ? OR description LIKE ?) `;
            args.push(`%${query}%`, `%${query}%`);
        }

        sql += `ORDER BY createdAt DESC LIMIT 50`;

        const result = await turso.execute({ sql, args });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}
