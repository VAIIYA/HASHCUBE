'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Hash, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Hashtag {
    tag: string;
    count: number;
}

export default function HashtagsPage() {
    const router = useRouter();
    const [hashtags, setHashtags] = useState<Hashtag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHashtags();
    }, []);

    const fetchHashtags = async () => {
        try {
            const res = await fetch('/api/hashtags');
            if (res.ok) {
                const data = await res.json();
                setHashtags(data);
            }
        } catch (error) {
            console.error('Error fetching hashtags:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-metamask-beige p-6 space-y-12">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-metamask-purple/60 hover:text-metamask-purple font-bold transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Home
                    </button>
                    <h1 className="text-4xl font-black text-metamask-purple tracking-tight">HASHTAGS</h1>
                    <div className="w-[80px]" /> {/* Spacer */}
                </div>

                {loading ? (
                    <div className="text-center py-20 font-bold text-metamask-purple/40 italic">Discovering tags...</div>
                ) : hashtags.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {hashtags.map((item, idx) => (
                            <motion.div
                                key={item.tag}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                onClick={() => router.push(`/search?tag=${encodeURIComponent(item.tag)}`)}
                                className="bg-white p-6 rounded-[24px] pill-shadow border border-white hover:border-metamask-orange transition-all cursor-pointer group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-metamask-orange/5 rounded-full flex items-center justify-center text-metamask-orange group-hover:bg-metamask-orange group-hover:text-white transition-colors">
                                        <Hash size={18} />
                                    </div>
                                    <span className="font-black text-metamask-purple group-hover:text-metamask-orange transition-colors">
                                        #{item.tag}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-metamask-purple/30 group-hover:text-metamask-purple/60 transition-colors uppercase">
                                    <TrendingUp size={12} />
                                    {item.count}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/20 rounded-3xl border border-dashed border-metamask-purple/20">
                        <p className="text-metamask-purple/40 font-bold">No hashtags found yet. Be the first to tag a post!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
