import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Use api.fxtwitter.com (FixTweet) to get media metadata including direct video URLs
        // Convert x.com or twitter.com to api.fxtwitter.com
        const fxUrl = url.replace(/(x\.com|twitter\.com)/, 'api.fxtwitter.com');

        const fxResponse = await fetch(fxUrl);
        if (fxResponse.ok) {
            const data = await fxResponse.json();
            const tweet = data.tweet;

            if (tweet) {
                // Find the best video variant (highest bitrate mp4)
                let videoUrl = '';
                if (tweet.media && tweet.media.videos && tweet.media.videos.length > 0) {
                    const video = tweet.media.videos[0];
                    // Look for mp4 variants and sort by bitrate
                    const mp4Variants = video.variants?.filter((v: any) => v.content_type === 'video/mp4')
                        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

                    videoUrl = mp4Variants?.[0]?.url || video.url;
                }

                return NextResponse.json({
                    title: `Post by ${tweet.author.name}`,
                    description: tweet.text,
                    video_url: videoUrl,
                    thumbnail_url: tweet.media?.videos?.[0]?.thumbnail_url || tweet.media?.all?.[0]?.thumbnail_url || '',
                    author_name: tweet.author.name,
                    author_url: tweet.author.url
                });
            }
        }

        // Fallback to standard oEmbed if FixTweet fails
        const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
            const data = await response.json();
            const text = data.html ? data.html.replace(/<[^>]*>/g, '').trim() : '';
            return NextResponse.json({
                title: data.author_name ? `Post by ${data.author_name}` : 'X Post',
                description: text,
                html: data.html,
                author_name: data.author_name,
                author_url: data.author_url
            });
        }

        throw new Error('Failed to fetch metadata from X');
    } catch (error: any) {
        console.error('Twitter metadata fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch X metadata' }, { status: 500 });
    }
}
