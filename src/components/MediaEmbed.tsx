'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { extractCID, extractIPNS, IPFS_GATEWAYS, getGatewayUrl } from '@/lib/ipfs';

interface MediaEmbedProps {
    values: string[]; // List of potential CIDs, URLs, or IPNS tags
}

export const MediaEmbed: React.FC<MediaEmbedProps> = ({ values }) => {
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'twitter' | 'markdown' | null>(null);
    const [src, setSrc] = useState<string>('');
    const [html, setHtml] = useState<string>('');
    const [markdownContent, setMarkdownContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!values || values.length === 0) {
            setLoading(false);
            return;
        }

        const resolveMedia = async () => {
            setLoading(true);
            setError(false);

            // Check for Twitter/X links first as they are direct
            const twitterUrl = values.find(v => /https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/.test(v || ''));
            if (twitterUrl) {
                try {
                    const res = await fetch(`/api/metadata/twitter?url=${encodeURIComponent(twitterUrl)}`);
                    if (res.ok) {
                        const data = await res.json();

                        // If we have a direct video URL, use it!
                        if (data.video_url) {
                            setSrc(data.video_url);
                            setMediaType('video');
                            setLoading(false);
                            return;
                        }

                        // Fallback to oEmbed html if no video found
                        if (data.html) {
                            setHtml(data.html);
                            setMediaType('twitter');
                            setLoading(false);

                            // Load Twitter widgets script if not already present
                            if (!document.getElementById('twitter-wjs')) {
                                const script = document.createElement('script');
                                script.id = 'twitter-wjs';
                                script.src = 'https://platform.twitter.com/widgets.js';
                                script.async = true;
                                document.head.appendChild(script);
                            } else if ((window as any).twttr && (window as any).twttr.widgets) {
                                (window as any).twttr.widgets.load();
                            }
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch twitter embed:', e);
                }
            }

            // Collect all unique CIDs and IPNS links from values
            const cids: string[] = [];
            const ipnsLinks: string[] = [];

            values.forEach(val => {
                if (!val) return;
                const cid = extractCID(val);
                if (cid) {
                    if (!cids.includes(cid)) cids.push(cid);
                } else {
                    const ipns = extractIPNS(val);
                    if (ipns && !ipnsLinks.includes(ipns)) ipnsLinks.push(ipns);
                }
            });

            // If we have nothing to resolve
            if (cids.length === 0 && ipnsLinks.length === 0) {
                setLoading(false);
                return;
            }

            // Try resolving CIDs first, then IPNS if needed
            // For now, we'll try the first CID across multiple gateways
            const targetCid = cids[0];
            const targetIpns = ipnsLinks[0];

            const tryGateways = async (id: string, isIpns: boolean) => {
                for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
                    const gateway = IPFS_GATEWAYS[i];
                    const url = isIpns
                        ? (id.startsWith('http') ? id : `https://ipfs.io/ipns/${id}`) // IPNS usually via primary gateway
                        : `${gateway}${id}`;

                    try {
                        const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
                        if (response.ok) {
                            const contentType = response.headers.get('Content-Type');
                            if (contentType?.startsWith('image/')) {
                                setSrc(url);
                                setMediaType('image');
                                return true;
                            } else if (contentType?.startsWith('video/')) {
                                setSrc(url);
                                setMediaType('video');
                                return true;
                            } else if (contentType?.startsWith('audio/')) {
                                setSrc(url);
                                setMediaType('audio');
                                return true;
                            } else if (contentType?.includes('markdown') || contentType?.startsWith('text/markdown') || url.toLowerCase().endsWith('.md')) {
                                try {
                                    const textRes = await fetch(url);
                                    if (textRes.ok) {
                                        const text = await textRes.text();
                                        setMarkdownContent(text);
                                        setMediaType('markdown');
                                        return true;
                                    }
                                } catch (e) {
                                    console.warn('Failed to fetch markdown content:', e);
                                }
                            }
                        }
                    } catch (e) {
                        console.warn(`Gateway ${gateway} failed for ${id}:`, e);
                    }

                    // Specific to IPNS, we only try one URL for now as it's often gateway-specific
                    if (isIpns) break;
                }
                return false;
            };

            let found = false;
            if (targetCid) {
                found = await tryGateways(targetCid, false);
            }

            if (!found && targetIpns) {
                found = await tryGateways(targetIpns, true);
            }

            if (!found) {
                // Fallback attempt: check extension for video/image if HEAD failed
                const fallbackUrl = targetCid ? getGatewayUrl(targetCid, 0) : null;
                if (fallbackUrl) {
                    const ext = fallbackUrl.split('.').pop()?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
                        setSrc(fallbackUrl);
                        setMediaType('image');
                        found = true;
                    } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
                        setSrc(fallbackUrl);
                        setMediaType('video');
                        found = true;
                    } else if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext || '')) {
                        setSrc(fallbackUrl);
                        setMediaType('audio');
                        found = true;
                    } else if (ext === 'md') {
                        try {
                            const textRes = await fetch(fallbackUrl);
                            if (textRes.ok) {
                                const text = await textRes.text();
                                setMarkdownContent(text);
                                setMediaType('markdown');
                                found = true;
                            }
                        } catch (e) {
                            console.warn('Failed to fetch markdown content (fallback):', e);
                        }
                    }
                }
            }

            setLoading(false);
            if (!found) setError(true);
        };

        resolveMedia();
    }, [values]);

    if (loading) return null; // Or a subtle loader if desired
    if (error || !mediaType) return null;

    return (
        <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 bg-black/5 flex justify-center items-center shadow-inner w-full">
            {mediaType === 'image' && (
                <img
                    src={src}
                    alt="Embedded content"
                    className="max-h-[600px] w-auto h-auto object-contain transition-opacity duration-300"
                    onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                    style={{ opacity: 0 }}
                />
            )}
            {mediaType === 'video' && (
                <video
                    src={src.includes('twimg.com') ? `/api/proxy/video?url=${encodeURIComponent(src)}` : src}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="max-h-[600px] w-full bg-black/20"
                />
            )}
            {mediaType === 'audio' && (
                <div className="w-full p-8 bg-black/5 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                    <audio
                        src={src}
                        controls
                        className="w-full max-w-md h-10"
                    />
                </div>
            )}
            {mediaType === 'twitter' && (
                <div
                    className="w-full max-w-[550px] p-4 bg-white"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            )}
            {mediaType === 'markdown' && (
                <div className="w-full p-8 md:p-12 bg-white/80 backdrop-blur-sm max-h-[800px] overflow-y-auto scrollbar-hide">
                    <article className="prose prose-sm md:prose-base max-w-none text-metamask-purple/90 
                        [&>h1]:text-3xl [&>h1]:font-black [&>h1]:mb-6 [&>h1]:text-metamask-purple
                        [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-metamask-purple/80
                        [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-metamask-purple/70
                        [&>p]:leading-relaxed [&>p]:mb-4
                        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
                        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
                        [&>blockquote]:border-l-4 [&>blockquote]:border-metamask-orange/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-metamask-orange/5 [&>blockquote]:py-2 [&>blockquote]:rounded-r-lg
                        [&>pre]:bg-metamask-purple/5 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:text-sm [&>pre]:font-mono [&>pre]:border [&>pre]:border-metamask-purple/10
                        [&>code]:bg-metamask-orange/10 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:text-metamask-orange [&>code]:font-bold [&>code]:text-sm
                        [&>img]:rounded-2xl [&>img]:shadow-lg [&>img]:mx-auto [&>img]:my-8 [&>img]:max-h-[500px]
                        [&>a]:text-metamask-blue [&>a]:hover:underline [&>a]:underline-offset-4 [&>a]:decoration-2
                        [&>hr]:border-t-2 [&>hr]:border-metamask-purple/5 [&>hr]:my-8
                        [&>table]:w-full [&>table]:mb-6 [&>table]:border-collapse
                        [&>table_th]:bg-metamask-purple/5 [&>table_th]:p-3 [&>table_th]:text-left [&>table_th]:font-bold [&>table_th]:border [&>table_th]:border-metamask-purple/10
                        [&>table_td]:p-3 [&>table_td]:border [&>table_td]:border-metamask-purple/10
                        [&>strong]:text-metamask-purple [&>strong]:font-black
                    ">
                        <ReactMarkdown>{markdownContent}</ReactMarkdown>
                    </article>
                </div>
            )}
        </div>
    );
};
