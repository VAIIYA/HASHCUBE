'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Plus, Twitter } from 'lucide-react';
import { Button, Input } from '@/components/ui/shared';
import { MediaEmbed } from '@/components/MediaEmbed';
import { motion } from 'framer-motion';

interface Post {
    id: string;
    title: string;
    type: string;
    value: string;
    description?: string;
    repliesCount?: number;
    createdAt: string;
    isOp: boolean;
    hashtags?: string;
    ipns?: string;
    xUrl?: string;
}

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [op, setOp] = useState<Post | null>(null);
    const [replies, setReplies] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchThread();
    }, [id]);

    const fetchThread = async () => {
        try {
            const res = await fetch(`/api/threads/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOp(data.op);
                setReplies(data.replies);
            }
        } catch (error) {
            console.error('Error fetching thread:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        if (!op) return;
        const text = encodeURIComponent(`Checkout this on HASHCUBE: ${op.title}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parentId: id,
                    description: replyText,
                }),
            });

            if (res.ok) {
                setReplyText('');
                fetchThread(); // Refresh thread
            }
        } catch (error) {
            console.error('Reply error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-metamask-beige p-6 flex items-center justify-center">Loading...</div>;
    if (!op) return <div className="min-h-screen bg-metamask-beige p-6 flex items-center justify-center">Thread not found</div>;

    return (
        <div className="min-h-screen bg-metamask-beige p-6 space-y-8 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-metamask-purple/60 hover:text-metamask-purple font-bold transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Index
            </button>

            {/* OP */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[32px] pill-shadow border border-white space-y-4"
            >
                <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                        <h1 className="text-3xl font-black text-metamask-purple">{op.title}</h1>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold bg-metamask-orange/10 text-metamask-orange px-3 py-1 rounded-full uppercase">OP</span>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-metamask-purple/40 hover:text-metamask-orange transition-colors"
                            >
                                <Twitter size={14} />
                                Share on X
                            </button>
                        </div>
                    </div>
                </div>
                <div className="text-sm font-mono bg-gray-50 p-4 rounded-xl break-all border border-gray-100">
                    <span className="text-metamask-purple/40 mr-2 uppercase">{op.type}:</span>
                    {op.value}
                </div>

                {op.ipns && (
                    <div className="space-y-2">
                        <div className="text-xs font-black text-metamask-purple/40 uppercase tracking-widest ml-1">IPNS Link</div>
                        <div className="text-sm font-mono bg-metamask-orange/5 p-4 rounded-xl break-all border border-metamask-orange/10 group relative">
                            <a
                                href={op.ipns.startsWith('http') ? op.ipns : `https://ipfs.io/ipns/${op.ipns}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-metamask-orange hover:underline pr-10 block"
                            >
                                {op.ipns}
                            </a>
                        </div>
                    </div>
                )}

                {op.xUrl && (
                    <div className="space-y-2">
                        <div className="text-xs font-black text-metamask-purple/40 uppercase tracking-widest ml-1">X.com Source</div>
                        <div className="text-sm font-mono bg-blue-50/5 p-4 rounded-xl break-all border border-blue-100/10 group relative">
                            <a
                                href={op.xUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline pr-10 block"
                            >
                                {op.xUrl}
                            </a>
                        </div>
                    </div>
                )}

                <MediaEmbed values={[op.xUrl || '', op.value || '', op.ipns || '', op.title || '', op.description || '']} />

                {op.description && <p className="text-metamask-purple/70 leading-relaxed font-medium">{op.description}</p>}
                {op.hashtags && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {JSON.parse(op.hashtags).map((tag: string) => (
                            <span
                                key={tag}
                                onClick={() => router.push(`/search?tag=${encodeURIComponent(tag)}`)}
                                className="text-xs font-black text-metamask-orange bg-metamask-orange/5 px-3 py-1 rounded-full cursor-pointer hover:bg-metamask-orange hover:text-white transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
                <div className="text-xs text-metamask-purple/30 font-bold uppercase tracking-widest pt-4 border-t border-gray-100 flex gap-4">
                    <span>{new Date(op.createdAt).toLocaleString()}</span>
                    <span>{op.id}</span>
                </div>
            </motion.div>

            {/* Replies */}
            <div className="space-y-4 pl-4 md:pl-12">
                {replies.map((reply, idx) => (
                    <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] pill-shadow-sm border border-white/50 space-y-2 relative"
                    >
                        <div className="absolute left-[-20px] top-6 w-[20px] h-[2px] bg-white/50 hidden md:block" />
                        <div className="text-sm text-metamask-purple/80 font-medium">{reply.description}</div>
                        <div className="text-[10px] text-metamask-purple/30 font-bold uppercase tracking-tighter flex gap-3">
                            <span>{new Date(reply.createdAt).toLocaleString()}</span>
                            <span>{reply.id}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleReply} className="pt-8 space-y-4">
                <div className="relative">
                    <Input
                        placeholder="Type your reply anonymously..."
                        className="h-16 pr-32"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Button type="submit" disabled={isSubmitting} className="h-10 gap-2">
                            <MessageSquare size={18} />
                            Post Reply
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
