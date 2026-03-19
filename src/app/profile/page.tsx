'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { ArrowLeft, User, LayoutGrid, Clock, Edit2, Check, X as CloseIcon, PlusCircle, MinusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreadCard } from '@/components/ThreadCard';
import { Button, Input } from '@/components/ui/shared';
import { SubmitForm } from '@/components/SubmitForm';

const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function ProfilePage() {
    const { publicKey, connected } = useWallet();
    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    useEffect(() => {
        if (connected && publicKey) {
            setLoading(true);
            const wallet = publicKey.toBase58();

            // Fetch threads
            fetch(`/api/threads?wallet=${wallet}`)
                .then(res => res.json())
                .then(data => {
                    setThreads(Array.isArray(data) ? data : []);
                })
                .catch(err => console.error('Error fetching user threads:', err))
                .finally(() => setLoading(false));

            // Fetch username
            fetch(`/api/user?wallet=${wallet}`)
                .then(res => res.json())
                .then(data => {
                    if (data.username) {
                        setUsername(data.username);
                        setEditValue(data.username);
                    }
                })
                .catch(err => console.error('Error fetching username:', err));
        } else {
            setThreads([]);
            setUsername(null);
        }
    }, [connected, publicKey]);

    const handleSaveUsername = async () => {
        if (!publicKey || !editValue.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    username: editValue.trim()
                })
            });
            if (res.ok) {
                setUsername(editValue.trim());
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving username:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const shortenedAddress = publicKey
        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
        : '';

    return (
        <div className="min-h-screen bg-metamask-beige p-6 space-y-12">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-metamask-purple/60 hover:text-metamask-purple font-bold transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Home
                    </Link>
                    <WalletMultiButton className="!bg-metamask-orange !rounded-full !h-12 !px-8 !font-black !text-xs !uppercase !tracking-widest !shadow-lg hover:!scale-105 transition-transform" />
                </div>

                {/* Profile Header */}
                <div className="bg-white p-10 rounded-[40px] pill-shadow border border-white flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    <div className="w-32 h-32 rounded-[40px] bg-metamask-beige flex items-center justify-center text-metamask-orange">
                        <User size={64} strokeWidth={1.5} />
                    </div>

                    <div className="flex-grow space-y-6 text-center md:text-left">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <span className="text-[10px] font-black bg-metamask-orange/10 text-metamask-orange px-3 py-1 rounded-full uppercase tracking-wider">
                                    Verified Wallet
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 w-full max-w-md">
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            placeholder="Choose a username..."
                                            className="!h-12 !py-0"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveUsername}
                                            disabled={isSaving}
                                            className="p-3 bg-metamask-orange text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditValue(username || '');
                                            }}
                                            className="p-3 bg-metamask-purple/5 text-metamask-purple rounded-full hover:scale-105 transition-transform"
                                        >
                                            <CloseIcon size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl md:text-5xl font-black text-metamask-purple tracking-tight">
                                            {connected ? (username || `Unnamed Explorer`) : 'Connect Wallet'}
                                        </h1>
                                        {connected && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 text-metamask-purple/20 hover:text-metamask-orange transition-colors"
                                            >
                                                <Edit2 size={24} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="font-mono text-metamask-purple/40 font-bold tracking-tight">
                                {connected ? publicKey?.toBase58() : 'Connect to view your HASHCUBE activity'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-8 justify-center md:justify-start">
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-metamask-orange">{threads.length}</div>
                                <div className="text-[10px] font-black text-metamask-purple/40 uppercase tracking-widest">Seeds Planted</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-metamask-orange">0</div>
                                <div className="text-[10px] font-black text-metamask-purple/40 uppercase tracking-widest">Total Echoes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Submit Form */}
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <Button
                            onClick={() => setShowSubmitForm(!showSubmitForm)}
                            className="gap-2 !h-14 !px-10 !rounded-full !text-lg !font-black !shadow-xl hover:!scale-105 transition-transform"
                        >
                            {showSubmitForm ? (
                                <>
                                    <MinusCircle size={24} />
                                    Close Form
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={24} />
                                    Add to HASHCUBE
                                </>
                            )}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showSubmitForm && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white p-8 md:p-12 rounded-[40px] pill-shadow border border-white max-w-2xl mx-auto mb-12">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-black text-metamask-purple">New Submission</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-metamask-orange italic">Attributed to your verified wallet</p>
                                    </div>
                                    <SubmitForm
                                        compact
                                        onSuccess={() => {
                                            setShowSubmitForm(false);
                                            // Refresh threads
                                            if (publicKey) {
                                                const wallet = publicKey.toBase58();
                                                fetch(`/api/threads?wallet=${wallet}`)
                                                    .then(res => res.json())
                                                    .then(data => setThreads(Array.isArray(data) ? data : []));
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* My Submissions */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-metamask-purple/5 flex items-center justify-center text-metamask-purple">
                            <LayoutGrid size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-metamask-purple">My Submissions</h2>
                    </div>

                    {!connected ? (
                        <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-[40px] border border-dashed border-metamask-purple/10 space-y-4">
                            <div className="text-metamask-purple/40 font-bold">Connect your wallet to see your history.</div>
                            <WalletMultiButton className="mx-auto !bg-metamask-purple !rounded-full !h-12 !px-8 !font-black !text-xs !uppercase !tracking-widest !shadow-lg hover:!scale-105 transition-transform" />
                        </div>
                    ) : loading ? (
                        <div className="text-center py-20 font-black text-metamask-purple/20 uppercase tracking-[0.2em] animate-pulse">Scanning Index...</div>
                    ) : threads.length === 0 ? (
                        <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-[40px] border border-dashed border-metamask-purple/10 space-y-4">
                            <div className="text-metamask-purple/40 font-bold italic">You haven't submitted anything yet.</div>
                            <Link href="/submit">
                                <Button variant="outline" size="sm">Start Submitting</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {threads.map((thread, idx) => (
                                <ThreadCard key={thread.id} thread={thread} idx={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
