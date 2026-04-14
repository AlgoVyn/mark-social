import { useEffect } from 'react';
import { PLATFORM_CONFIGS } from '../utils/platforms';

interface SEOProps {
  platform: string;
}

// Platform-specific SEO metadata - aligned with PLATFORM_CONFIGS
const PLATFORM_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  linkedin: {
    title: 'LinkedIn Post Formatter - Markdown to LinkedIn Converter',
    description:
      'Convert Markdown to perfectly formatted LinkedIn posts. Auto-format bold, italic, lists, and links for professional networking content.',
    keywords:
      'linkedin formatter, linkedin post generator, markdown to linkedin, linkedin content tool, professional networking posts',
  },
  twitter: {
    title: 'Twitter/X Post Formatter - Markdown to Tweet Converter',
    description:
      'Convert Markdown to Twitter/X posts with character counting. Format threads, bold text, and links. Stay within the 280 character limit.',
    keywords:
      'twitter formatter, tweet generator, markdown to twitter, twitter thread maker, X post formatter, character counter',
  },
  instagram: {
    title: 'Instagram Caption Formatter - Markdown to Instagram Converter',
    description:
      'Convert Markdown to Instagram captions with proper formatting. Bold text, lists, and hashtags for engaging social media content.',
    keywords:
      'instagram caption formatter, instagram post generator, markdown to instagram, caption maker, instagram content tool',
  },
  threads: {
    title: 'Threads Post Formatter - Markdown to Threads Converter',
    description:
      "Convert Markdown to Threads posts with 500 character limit tracking. Format text for Meta's text-based social platform.",
    keywords:
      'threads formatter, threads post generator, markdown to threads, meta threads tool, threads character counter',
  },
  mastodon: {
    title: 'Mastodon Post Formatter - Markdown to Mastodon Converter',
    description:
      'Convert Markdown to Mastodon toots with 500 character limit. Format posts for the decentralized social network.',
    keywords:
      'mastodon formatter, toot generator, markdown to mastodon, fediverse tool, decentralized social media',
  },
  bluesky: {
    title: 'Bluesky Post Formatter - Markdown to Bluesky Converter',
    description:
      'Convert Markdown to Bluesky posts with 300 character limit tracking. Format content for the AT Protocol social network.',
    keywords:
      'bluesky formatter, bluesky post generator, markdown to bluesky, at protocol, bluesky character counter',
  },
  discord: {
    title: 'Discord Message Formatter - Markdown to Discord Converter',
    description:
      'Convert Markdown to Discord messages with proper formatting. Bold, italic, code blocks, and mentions for Discord communities.',
    keywords:
      'discord formatter, discord message generator, markdown to discord, discord text formatting, community chat tool',
  },
  reddit: {
    title: 'Reddit Post Formatter - Markdown to Reddit Converter',
    description:
      'Convert Markdown to Reddit posts and comments. Format text for subreddit submissions with proper styling.',
    keywords:
      'reddit formatter, reddit post generator, markdown to reddit, subreddit tool, reddit content formatter',
  },
  youtube: {
    title: 'YouTube Description Formatter - Markdown to YouTube Converter',
    description:
      'Convert Markdown to YouTube video descriptions. Format timestamps, links, and styled text for video content.',
    keywords:
      'youtube description formatter, youtube video tool, markdown to youtube, video description generator, youtube seo',
  },
  facebook: {
    title: 'Facebook Post Formatter - Markdown to Facebook Converter',
    description:
      'Convert Markdown to Facebook posts with proper formatting. Bold, italic, lists, and links for engaging social media content.',
    keywords:
      'facebook formatter, facebook post generator, markdown to facebook, social media tool, facebook content creator',
  },
  tiktok: {
    title: 'TikTok Caption Formatter - Markdown to TikTok Converter',
    description:
      'Convert Markdown to TikTok captions with formatting. Bold text, hashtags, and styled content for viral video descriptions.',
    keywords:
      'tiktok caption formatter, tiktok description generator, markdown to tiktok, video caption tool, tiktok content creator',
  },
  telegram: {
    title: 'Telegram Message Formatter - Markdown to Telegram Converter',
    description:
      'Convert Markdown to Telegram messages with proper formatting. Bold, italic, code snippets for channels, groups, and bots.',
    keywords:
      'telegram formatter, telegram message generator, markdown to telegram, telegram bot formatting, channel message tool',
  },
};

const DEFAULT_SEO = {
  title: 'Markdown2Social - Free Markdown to Social Media Converter',
  description:
    'Free online tool to convert Markdown to formatted posts for LinkedIn, Twitter/X, Instagram, Mastodon, Bluesky, Reddit, YouTube, Discord, Facebook, TikTok, Telegram, and Threads. Features live preview, character counting, one-click copy, multiple formatting styles, and draft history.',
  keywords:
    'markdown converter, social media formatter, markdown to linkedin, markdown to twitter, markdown to instagram, markdown to mastodon, markdown to bluesky, markdown to facebook, markdown to tiktok, markdown to telegram, live preview, character counter, social media tool, content formatter, markdown editor, social post generator, unicode formatter, bold text generator, italic text formatter',
};

// Base URL configurable via environment variable
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://algovyn.github.io/markdown2social';

export const SEO: React.FC<SEOProps> = ({ platform }) => {
  const config = PLATFORM_CONFIGS[platform];
  // Use DEFAULT_SEO for home page ('default'), otherwise use platform-specific SEO
  const seo = platform === 'default' ? DEFAULT_SEO : PLATFORM_SEO[platform] || DEFAULT_SEO;
  // For canonical URL: home page is just BASE_URL, linkedin is also BASE_URL (same as home),
  // other platforms get their own URL
  const canonicalUrl =
    !platform || platform === 'default' || platform === 'linkedin'
      ? `${BASE_URL}/`
      : `${BASE_URL}/${platform}/`;

  useEffect(() => {
    // Update document title
    document.title = seo.title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        // Mark as dynamically created for cleanup
        element.setAttribute('data-seo-dynamic', 'true');
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update standard meta tags
    updateMetaTag('title', seo.title);
    updateMetaTag('description', seo.description);
    updateMetaTag('keywords', seo.keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', seo.title, true);
    updateMetaTag('og:description', seo.description, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:image', `${BASE_URL}/logo/logo.svg`, true);

    // Update Twitter tags
    updateMetaTag('twitter:title', seo.title, true);
    updateMetaTag('twitter:description', seo.description, true);
    updateMetaTag('twitter:url', canonicalUrl, true);
    updateMetaTag('twitter:image', `${BASE_URL}/logo/logo.svg`, true);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update JSON-LD structured data
    let jsonLdScript = document.querySelector(
      'script[type="application/ld+json"]'
    ) as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Markdown2Social',
      url: canonicalUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description: seo.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: `Markdown parsing, ${config?.name || 'Social media'} preview, One-click copy, Character counting, Format optimization`,
    };

    jsonLdScript.textContent = JSON.stringify(structuredData);

    // Cleanup function - remove ALL dynamically created elements
    // This prevents orphaned elements when platform changes rapidly
    return () => {
      document.querySelectorAll('[data-seo-dynamic="true"]').forEach((element) => {
        element.remove();
      });
    };
  }, [platform, seo, canonicalUrl, config?.name]);

  return null; // This component doesn't render anything visible
};

export default SEO;
