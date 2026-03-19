'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThreadPreview } from './ThreadPreview';

interface ThreadCardProps {
    thread: {
        id: string;
        title: string;
        type: string;
        value: string;
        repliesCount: number;
        lastReplyAt: string;
        hashtags?: string;
        ipns?: string;
        xUrl?: string;
    };
    idx: number;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread, idx }) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => router.push(`/thread/${thread.id}`)}
            className="bg-white p-6 rounded-[32px] pill-shadow border border-white hover:border-metamask-orange transition-all cursor-pointer group flex flex-col h-full"
        >
            <div className="space-y-4 flex-grow">
                <ThreadPreview value={thread.value} ipns={thread.ipns} xUrl={thread.xUrl} />
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-black text-metamask-purple line-clamp-2 leading-tight group-hover:text-metamask-orange transition-colors">
                        {thread.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded text-metamask-purple/40 uppercase">
                            {thread.type}
                        </span>
                        {thread.ipns && (
                            <span className="text-[10px] font-black bg-metamask-orange text-white px-2 py-1 rounded uppercase">
                                IPNS
                            </span>
                        )}
                    </div>
                </div>
                <p className="text-sm font-mono bg-gray-50 p-3 rounded-xl break-all line-clamp-2 text-metamask-purple/40 border border-gray-50">
                    {thread.value}
                </p>
                {thread.hashtags && (
                    <div className="flex flex-wrap gap-2">
                        {JSON.parse(thread.hashtags).map((tag: string) => (
                            <span
                                key={tag}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/search?tag=${encodeURIComponent(tag)}`);
                                }}
                                className="text-[10px] font-black text-metamask-orange bg-metamask-orange/5 px-2 py-0.5 rounded-full hover:bg-metamask-orange hover:text-white transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between text-metamask-purple/40">
                <div className="flex items-center gap-1.5 transition-colors group-hover:text-metamask-purple">
                    <MessageSquare size={14} />
                    <span className="text-xs font-bold">{thread.repliesCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase">
                        {new Date(thread.lastReplyAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
