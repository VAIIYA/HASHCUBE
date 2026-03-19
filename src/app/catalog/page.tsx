import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/shared';
import { ThreadCard } from '@/components/ThreadCard';
import turso from '@/lib/turso';

export const dynamic = 'force-dynamic';

async function getThreads() {
    try {
        const result = await turso.execute(`
            SELECT * FROM links 
            WHERE isOp = 1 
            ORDER BY lastReplyAt DESC 
            LIMIT 100
        `);
        return result.rows.map(row => ({
            id: String(row.id),
            title: String(row.title || ''),
            type: String(row.type || ''),
            value: String(row.value || ''),
            repliesCount: Number(row.repliesCount || 0),
            lastReplyAt: String(row.lastReplyAt || ''),
            hashtags: String(row.hashtags || ''),
            ipns: String(row.ipns || '')
        })) as any[];
    } catch (error) {
        console.error('Error fetching threads:', error);
        return [];
    }
}

export default async function CatalogPage() {
    const threads = await getThreads();

    return (
        <div className="min-h-screen bg-metamask-beige p-6 space-y-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-metamask-purple/60 hover:text-metamask-purple font-bold transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Home
                    </Link>
                    <h1 className="text-4xl font-black text-metamask-purple tracking-tight">INDEX CATALOG</h1>
                    <Link href="/submit">
                        <Button>New Thread</Button>
                    </Link>
                </div>

                {threads.length === 0 ? (
                    <div className="text-center py-20 font-bold text-metamask-purple/40">No threads found in the index.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {threads.map((thread, idx) => (
                            <ThreadCard key={thread.id} thread={thread} idx={idx} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
