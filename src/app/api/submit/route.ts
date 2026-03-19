import { NextResponse } from 'next/server';
import turso from '@/lib/turso';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, type, value, description, parentId, hashtags, ipns, walletAddress, xUrl } = body;

        const id = crypto.randomUUID();
        const linkType = 'ipfs'; // Enforce ipfs
        const now = new Date().toISOString();

        // Process hashtags: max 3, sanitized
        let processedHashtags = null;
        if (Array.isArray(hashtags) && hashtags.length > 0) {
            processedHashtags = JSON.stringify(
                hashtags.slice(0, 3).map((tag: string) => tag.trim().replace(/^#/, '').toLowerCase())
            );
        }

        if (parentId) {
            // It's a reply
            await turso.execute({
                sql: `INSERT INTO links (id, title, type, value, description, parentId, isOp, lastReplyAt, createdAt, updatedAt, hashtags, ipns, walletAddress, xUrl) 
                      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, title || 'Reply', linkType, value || null, description || '', parentId, now, now, now, processedHashtags, ipns || null, walletAddress || null, xUrl || null]
            });

            // Update parent thread
            await turso.execute({
                sql: `UPDATE links SET repliesCount = repliesCount + 1, lastReplyAt = ? WHERE id = ?`,
                args: [now, parentId]
            });

            return NextResponse.json({ id, title: title || 'Reply', type: linkType, value: value || '', description, parentId, hashtags: processedHashtags ? JSON.parse(processedHashtags) : [], ipns }, { status: 201 });
        } else {
            // It's a new thread
            if (!title || (!value && !ipns && !xUrl)) {
                return NextResponse.json({ error: 'Missing required fields (Title and at least one source link)' }, { status: 400 });
            }

            await turso.execute({
                sql: `INSERT INTO links (id, title, type, value, description, isOp, lastReplyAt, createdAt, updatedAt, hashtags, ipns, walletAddress, xUrl) 
                      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, title, linkType, value || null, description || '', now, now, now, processedHashtags, ipns || null, walletAddress || null, xUrl || null]
            });

            return NextResponse.json({ id, title, type: linkType, value, description, hashtags: processedHashtags ? JSON.parse(processedHashtags) : [], ipns }, { status: 201 });
        }
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({
            error: 'Failed to submit link',
            details: error.message
        }, { status: 500 });
    }
}
