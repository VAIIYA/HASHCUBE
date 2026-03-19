'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="w-full bg-white/50 backdrop-blur-md border-t border-white py-12 px-6 mt-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Logo and Copyright */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-metamask-orange rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-metamask-purple tracking-tight">HASHCUBE</span>
                        <span className="text-[10px] text-metamask-purple/40 font-bold uppercase tracking-widest">Decentralized Index</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    <Link href="/" className="text-sm font-bold text-metamask-purple/60 hover:text-metamask-orange transition-colors">
                        Home
                    </Link>
                    <Link href="/catalog" className="text-sm font-bold text-metamask-purple/60 hover:text-metamask-orange transition-colors">
                        Catalog
                    </Link>
                    <Link href="/hashtags" className="text-sm font-bold text-metamask-purple/60 hover:text-metamask-orange transition-colors">
                        Hashtags
                    </Link>
                    <Link href="/profile" className="text-sm font-bold text-metamask-purple/60 hover:text-metamask-orange transition-colors">
                        Profile
                    </Link>
                    <Link href="/submit" className="text-sm font-bold text-metamask-purple/60 hover:text-metamask-orange transition-colors">
                        Submit
                    </Link>
                    <a
                        href="https://docs.ipfs.tech/install/ipfs-desktop/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-metamask-purple/60 hover:text-metamask-orange transition-colors"
                    >
                        IPFS Desktop
                    </a>
                </div>

                {/* Token Link */}
                <a
                    href="https://jup.ag/tokens/CrtU3F8hhqYQUC5WD6s9NFdTns1U1xnBWsec5gvVjups"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2.5 bg-metamask-orange/5 border border-metamask-orange/20 rounded-full text-metamask-orange hover:bg-metamask-orange hover:text-white transition-all group"
                >
                    <span className="text-xs font-black uppercase tracking-widest">HASHCUBE Token</span>
                    <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
            </div>

            <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-metamask-purple/5 flex justify-center text-[10px] text-metamask-purple/20 font-bold uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} HASHCUBE. All rights reserved.
            </div>
        </footer>
    );
};
