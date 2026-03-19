import { NextResponse } from 'next/server';
import turso from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
        }

        const result = await turso.execute({
            sql: `SELECT * FROM users WHERE walletAddress = ?`,
            args: [wallet]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ username: null });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { walletAddress, username } = body;

        if (!walletAddress || !username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Check if user exists
        const check = await turso.execute({
            sql: `SELECT 1 FROM users WHERE walletAddress = ?`,
            args: [walletAddress]
        });

        if (check.rows.length > 0) {
            // Update
            await turso.execute({
                sql: `UPDATE users SET username = ?, updatedAt = ? WHERE walletAddress = ?`,
                args: [username, now, walletAddress]
            });
        } else {
            // Insert
            await turso.execute({
                sql: `INSERT INTO users (walletAddress, username, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
                args: [walletAddress, username, now, now]
            });
        }

        return NextResponse.json({ walletAddress, username, updatedAt: now });
    } catch (error) {
        console.error('Save user error:', error);
        return NextResponse.json({ error: 'Failed to save user' }, { status: 500 });
    }
}
