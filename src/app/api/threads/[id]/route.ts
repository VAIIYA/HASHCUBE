import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const opResult = await turso.execute({
            sql: "SELECT * FROM links WHERE id = ?",
            args: [id]
        });

        const op = opResult.rows[0];

        if (!op) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
        }

        const repliesResult = await turso.execute({
            sql: "SELECT * FROM links WHERE parentId = ? ORDER BY createdAt ASC",
            args: [id]
        });

        return NextResponse.json({ op, replies: repliesResult.rows });
    } catch (error) {
        console.error('Fetch thread detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch thread detail' }, { status: 500 });
    }
}
