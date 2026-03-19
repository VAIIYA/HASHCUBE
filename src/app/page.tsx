'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Search, PlusCircle, Globe, Zap, Shield, Hash, Wallet, User } from 'lucide-react';
import { Button, Input } from '@/components/ui/shared';
import { motion } from 'framer-motion';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { connected } = useWallet();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-metamask-beige">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-metamask-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-metamask-blue/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl text-center space-y-12"
      >
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-white rounded-3xl pill-shadow flex items-center justify-center border border-white">
            <div className="w-16 h-16 bg-metamask-orange rounded-2xl flex items-center justify-center text-white">
              <Zap size={40} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-black text-metamask-purple tracking-tight leading-none">
            HASHCUBE
          </h1>
          <p className="text-xl text-metamask-purple/60 font-medium italic italic">
            "We. As One."
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-metamask-orange transition-colors" size={24} />
            <Input
              type="text"
              placeholder="Search IPFS hashes..."
              className="pl-16 pr-32 h-16 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button type="submit" size="sm" className="h-10">
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => router.push('/submit')} className="gap-2">
              <PlusCircle size={20} />
              Anonymous Submit
            </Button>
            <Button variant="outline" onClick={() => router.push('/catalog')} className="gap-2">
              <Globe size={20} />
              Browse Catalog
            </Button>
            <Button variant="outline" onClick={() => router.push('/hashtags')} className="gap-2">
              <Hash size={20} />
              Browse Hashtags
            </Button>
          </div>
          <Button variant="outline" onClick={() => router.push('/profile')} className="gap-2">
            {connected ? (
              <>
                <User size={20} className="text-metamask-orange" />
                Logged In
              </>
            ) : (
              <>
                <Wallet size={20} />
                Login with Solana Wallet
              </>
            )}
          </Button>
        </div>

        {/* Features Tagline */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureItem icon={<Shield size={24} />} title="Anonymous" desc="No logs, no tracking. Pure p2p." />
          <FeatureItem icon={<Zap size={24} />} title="Lightning Fast" desc="Search across millions of hashes." />
          <FeatureItem icon={<Globe size={24} />} title="Decentralized" desc="Focused on pure IPFS CIDs." />
        </div>
      </motion.div>
    </main>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-center text-metamask-orange">
        {icon}
      </div>
      <h3 className="font-bold text-metamask-purple">{title}</h3>
      <p className="text-sm text-metamask-purple/50">{desc}</p>
    </div>
  );
}
