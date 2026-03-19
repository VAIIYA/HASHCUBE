import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        let sql = `
            SELECT * FROM links 
            WHERE isOp = 1
        `;
        const args: any[] = [];

        if (wallet) {
            sql += ` AND walletAddress = ?`;
            args.push(wallet);
        }

        sql += ` ORDER BY lastReplyAt DESC LIMIT 100`;

        const result = await turso.execute({ sql, args });

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Fetch threads error:', error);
        return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
    }
}
