'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, X, Shield, Wallet } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface SubmitFormProps {
    onSuccess?: () => void;
    compact?: boolean;
}

export const SubmitForm: React.FC<SubmitFormProps> = ({ onSuccess, compact = false }) => {
    const { publicKey, connected } = useWallet();
    const [formData, setFormData] = useState({
        title: '',
        type: 'ipfs',
        value: '',
        description: '',
        hashtags: [] as string[],
        ipns: '',
        xUrl: '',
    });
    const [tagInput, setTagInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [fetchingMetadata, setFetchingMetadata] = useState(false);

    const handleIPFSChange = (val: string) => {
        const trimmed = val.trim();
        if (trimmed.includes('/ipns/') || trimmed.startsWith('k51') || trimmed.startsWith('k2k')) {
            setFormData({ ...formData, ipns: trimmed, value: '' });
        } else {
            setFormData({ ...formData, value: trimmed, ipns: '' });
        }
    };

    const handleXChange = async (val: string) => {
        setFormData({ ...formData, xUrl: val });

        // Detect X/Twitter Status URL
        const twitterRegex = /https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;
        if (twitterRegex.test(val)) {
            setFetchingMetadata(true);
            try {
                const res = await fetch(`/api/metadata/twitter?url=${encodeURIComponent(val)}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        title: prev.title || data.title || '',
                        description: prev.description || data.description || '',
                    }));
                }
            } catch (error) {
                console.error('Error fetching twitter metadata:', error);
            } finally {
                setFetchingMetadata(false);
            }
        }
    };

    const [submissionMode, setSubmissionMode] = useState<'wallet' | 'anonymous'>('wallet');

    const handleSubmission = async (e?: React.FormEvent, mode_override?: 'wallet' | 'anonymous') => {
        if (e) e.preventDefault();

        const activeMode = mode_override || submissionMode;
        setStatus('loading');

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    walletAddress: (connected && activeMode === 'wallet') ? publicKey?.toBase58() : null,
                }),
            });
            if (res.ok) {
                setStatus('success');
                if (onSuccess) {
                    setTimeout(onSuccess, 2000);
                }
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
            >
                <div className="flex justify-center text-green-500">
                    <CheckCircle2 size={compact ? 48 : 64} />
                </div>
                <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-metamask-purple`}>Submission Successful!</h2>
                <p className="text-metamask-purple/60 text-sm">Content added to the decentralized index.</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={(e) => handleSubmission(e)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-metamask-purple/40 ml-4 italic">Title</label>
                <Input
                    required
                    placeholder="Name of the file/content"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-metamask-purple/40 ml-4 italic">
                    IPFS CID or IPNS URL
                </label>
                <Input
                    placeholder="Qm... or k51... or https://ipfs.io/ipns/..."
                    value={formData.value || formData.ipns}
                    onChange={(e) => handleIPFSChange(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-metamask-purple/40 ml-4 italic">
                    X.COM VIDEO URL (Optional)
                </label>
                <Input
                    placeholder="https://x.com/..."
                    value={formData.xUrl}
                    onChange={(e) => handleXChange(e.target.value)}
                    disabled={fetchingMetadata}
                />
                {fetchingMetadata && (
                    <p className="text-[10px] text-metamask-orange animate-pulse ml-4 italic">Fetching post metadata...</p>
                )}
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-metamask-purple/40 ml-4 italic">
                    Hashtags (Max 3)
                </label>

                <div className="relative group">
                    <Input
                        placeholder={formData.hashtags.length >= 3 ? "Limit reached" : "Press Enter to add tags..."}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                                e.preventDefault();
                                if (formData.hashtags.length < 3) {
                                    const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
                                    if (!formData.hashtags.includes(newTag)) {
                                        setFormData({
                                            ...formData,
                                            hashtags: [...formData.hashtags, newTag]
                                        });
                                    }
                                    setTagInput('');
                                }
                            }
                        }}
                        disabled={formData.hashtags.length >= 3}
                        className="pr-12"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="text-[10px] font-black text-metamask-purple/20 uppercase tracking-widest">
                            {formData.hashtags.length}/3
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 px-2">
                    <AnimatePresence mode="popLayout">
                        {formData.hashtags.map((tag) => (
                            <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-metamask-orange/10 text-metamask-orange rounded-full text-xs font-bold border border-metamask-orange/20 group hover:bg-metamask-orange/20 transition-colors"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        hashtags: formData.hashtags.filter(t => t !== tag)
                                    })}
                                    className="hover:text-metamask-purple transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                    {formData.hashtags.length === 0 && !tagInput && (
                        <span className="text-[10px] text-metamask-purple/30 italic ml-2">Press enter to add tags...</span>
                    )}
                </div>
            </div>

            {!compact && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-metamask-purple/40 ml-4 italic">Description (Optional)</label>
                    <Textarea
                        placeholder="Briefly describe what this is..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl text-sm font-bold">
                    <AlertCircle size={18} />
                    Failed to submit. Please try again.
                </div>
            )}

            <div className="space-y-3">
                {connected && (
                    <Button
                        type="button"
                        variant="outline"
                        className={`w-full gap-2 ${compact ? 'h-12' : 'h-14'} border-metamask-purple/10 hover:bg-metamask-purple/5`}
                        disabled={status === 'loading'}
                        onClick={() => handleSubmission(undefined, 'anonymous')}
                    >
                        <Shield size={20} />
                        Anonymous Submit
                    </Button>
                )}

                <Button
                    type="submit"
                    className={`w-full gap-2 ${compact ? 'h-12' : 'h-14'}`}
                    disabled={status === 'loading'}
                    onClick={() => setSubmissionMode('wallet')}
                >
                    {status === 'loading' ? (
                        'Processing...'
                    ) : (
                        <>
                            {connected ? <Wallet size={20} /> : <Shield size={20} />}
                            {connected ? 'Submit with Wallet' : 'Submit Anonymously'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};
