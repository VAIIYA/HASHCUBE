'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ArrowLeft, Copy, Download, Hash, ExternalLink, Zap } from 'lucide-react';
import { Button, Input } from '@/components/ui/shared';
import { motion } from 'framer-motion';

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query) params.append('q', query);
                if (tag) params.append('tag', tag);

                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query || tag) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [query, tag]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-metamask-beige p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-metamask-purple/60 hover:text-metamask-purple font-bold transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            defaultValue={query}
                            placeholder="Search..."
                            className="pl-12 h-12"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.push(`/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-metamask-purple">
                        {loading ? 'Searching...' : tag ? `Results for #${tag}` : `Results for "${query}"`}
                    </h2>
                    {!loading && <span className="text-metamask-purple/50">{results.length} results found</span>}
                </div>

                {/* Results List */}
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 bg-white/50 animate-pulse rounded-3xl border border-white" />
                        ))
                    ) : results.length > 0 ? (
                        results.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => router.push(`/thread/${item.id}`)}
                                className="bg-white p-6 rounded-3xl pill-shadow border border-white group hover:border-metamask-orange/30 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Hash size={16} className="text-metamask-blue" />
                                            <span className="text-xs font-black uppercase tracking-widest text-metamask-purple/40">{item.type}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-metamask-purple group-hover:text-metamask-orange transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.description && <p className="text-metamask-purple/60 text-sm line-clamp-1">{item.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(item.value); }} className="gap-2">
                                            <Copy size={16} />
                                            Copy
                                        </Button>
                                        <a href={`/thread/${item.id}`} onClick={(e) => e.stopPropagation()}>
                                            <Button size="sm" className="gap-2">
                                                <ExternalLink size={16} />
                                                Open
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/20 rounded-3xl border border-dashed border-metamask-purple/20">
                            <p className="text-metamask-purple/40 font-bold">No results found for your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchResults() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-metamask-beige p-6 flex items-center justify-center text-metamask-purple italic">Loading results...</div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
