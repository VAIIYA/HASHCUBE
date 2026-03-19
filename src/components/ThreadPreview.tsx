'use client';

import React, { useState, useEffect } from 'react';
import { extractCID, extractIPNS, IPFS_GATEWAYS, getGatewayUrl } from '@/lib/ipfs';
import { Play } from 'lucide-react';

interface ThreadPreviewProps {
    value?: string;
    ipns?: string;
    xUrl?: string;
}

export const ThreadPreview: React.FC<ThreadPreviewProps> = ({ value, ipns, xUrl }) => {
    const [preview, setPreview] = useState<{
        url: string;
        renderType: 'image' | 'video' | 'audio';
        showPlayButton: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const resolvePreview = async () => {
            // Check for Twitter/X first
            const targetX = xUrl || (value?.match(/https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/) ? value : null);
            if (targetX) {
                try {
                    const res = await fetch(`/api/metadata/twitter?url=${encodeURIComponent(targetX)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.thumbnail_url) {
                            setPreview({
                                url: data.thumbnail_url,
                                renderType: 'image',
                                showPlayButton: true
                            });
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch twitter preview:', e);
                }
            }

            // Extract CID or IPNS
            const cid = (value ? extractCID(value) : null) || (ipns ? extractCID(ipns) : null);
            const ipnsKey = !cid ? (value ? extractIPNS(value) : null) || (ipns ? extractIPNS(ipns) : null) : null;

            if (!cid && !ipnsKey) {
                setLoading(false);
                return;
            }

            // Try multiple gateways for IPFS content
            const tryGateways = async (id: string, isIpns: boolean) => {
                for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
                    const gateway = IPFS_GATEWAYS[i];
                    const url = isIpns
                        ? (id.startsWith('http') ? id : `https://ipfs.io/ipns/${id}`)
                        : `${gateway}${id}`;

                    const ext = url.split('.').pop()?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
                        setPreview({
                            url,
                            renderType: 'image',
                            showPlayButton: false
                        });
                        return true;
                    } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
                        setPreview({
                            url,
                            renderType: 'video',
                            showPlayButton: true
                        });
                        return true;
                    } else if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext || '')) {
                        setPreview({
                            url,
                            renderType: 'audio',
                            showPlayButton: true
                        });
                        return true;
                    }

                    try {
                        const headRes = await fetch(url, {
                            method: 'HEAD',
                            mode: 'cors',
                            cache: 'force-cache'
                        });

                        if (headRes.ok) {
                            const contentType = headRes.headers.get('Content-Type');
                            if (contentType?.startsWith('image/')) {
                                setPreview({
                                    url,
                                    renderType: 'image',
                                    showPlayButton: false
                                });
                                return true;
                            } else if (contentType?.startsWith('audio/')) {
                                setPreview({
                                    url,
                                    renderType: 'audio',
                                    showPlayButton: true
                                });
                                return true;
                            }
                        }
                    } catch (e) {
                        console.warn(`Gateway ${gateway} failed for:`, id);
                    }

                    if (isIpns) break;
                }
                return false;
            };

            let found = false;
            if (cid) {
                found = await tryGateways(cid, false);
            }
            if (!found && ipnsKey) {
                found = await tryGateways(ipnsKey, true);
            }

            setLoading(false);
        };

        resolvePreview();
    }, [value, ipns, xUrl]);

    if (loading) return (
        <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-bold text-metamask-purple/20 uppercase tracking-widest">Loading...</span>
        </div>
    );

    if (!preview) return (
        <div className="aspect-video bg-metamask-purple/[0.03] rounded-2xl flex items-center justify-center border border-dashed border-metamask-purple/10">
            <span className="text-[10px] font-bold text-metamask-purple/20 uppercase tracking-widest italic">No Preview</span>
        </div>
    );

    return (
        <div className="aspect-video rounded-2xl overflow-hidden relative group/preview bg-black/5 flex items-center justify-center">
            {preview.renderType === 'image' ? (
                <img
                    src={preview.url}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-110"
                />
            ) : preview.renderType === 'video' ? (
                <video
                    src={`${preview.url}#t=0.1`}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                />
            ) : (
                <div className="w-full h-full bg-metamask-purple/[0.05] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-metamask-purple/10 flex items-center justify-center text-metamask-purple/40">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                </div>
            )}

            {preview.showPlayButton && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/preview:bg-black/20 transition-colors pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl transform group-hover/preview:scale-110 transition-transform">
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
};
