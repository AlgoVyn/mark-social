import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SEO } from './SEO';

describe('SEO', () => {
  // Store original title
  const originalTitle = document.title;

  beforeEach(() => {
    // Clean up any existing meta tags with data-seo-dynamic
    document.querySelectorAll('[data-seo-dynamic="true"]').forEach((el) => el.remove());
    document.title = originalTitle;
  });

  afterEach(() => {
    // Clean up after each test
    document.querySelectorAll('[data-seo-dynamic="true"]').forEach((el) => el.remove());
    document.title = originalTitle;
  });

  describe('document title', () => {
    it('should set title for default/home platform', () => {
      render(<SEO platform="default" />);

      expect(document.title).toContain('Markdown2Social');
      expect(document.title).toContain('12+ Platforms');
    });

    it('should set platform-specific title for LinkedIn', () => {
      render(<SEO platform="linkedin" />);

      expect(document.title).toContain('LinkedIn');
      expect(document.title).toContain('Markdown2Social');
    });

    it('should set platform-specific title for Twitter', () => {
      render(<SEO platform="twitter" />);

      expect(document.title).toContain('Twitter');
      expect(document.title).toContain('Markdown2Social');
    });

    it('should set platform-specific title for all supported platforms', () => {
      const platforms = [
        'linkedin',
        'twitter',
        'instagram',
        'threads',
        'mastodon',
        'bluesky',
        'discord',
        'reddit',
        'youtube',
        'facebook',
        'tiktok',
        'telegram',
      ];

      platforms.forEach((platform) => {
        // Clean up between renders
        document.querySelectorAll('[data-seo-dynamic="true"]').forEach((el) => el.remove());

        render(<SEO platform={platform} />);

        expect(document.title).toContain('Markdown2Social');
        // Title should be platform-specific (not the default)
        expect(document.title).not.toContain('12+ Platforms');
      });
    });

    it('should use default SEO for unknown platform', () => {
      render(<SEO platform="unknown-platform" />);

      // Should fall back to default SEO
      expect(document.title).toContain('Markdown2Social');
    });
  });

  describe('meta tags', () => {
    it('should create description meta tag', () => {
      render(<SEO platform="linkedin" />);

      const descriptionMeta = document.querySelector('meta[name="description"]');
      expect(descriptionMeta).toBeInTheDocument();
      expect(descriptionMeta?.getAttribute('content')).toContain('LinkedIn');
    });

    it('should create keywords meta tag', () => {
      render(<SEO platform="twitter" />);

      const keywordsMeta = document.querySelector('meta[name="keywords"]');
      expect(keywordsMeta).toBeInTheDocument();
      expect(keywordsMeta?.getAttribute('content')).toBeTruthy();
    });

    it('should create Open Graph meta tags', () => {
      render(<SEO platform="default" />);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle).toBeInTheDocument();
      expect(ogTitle?.getAttribute('content')).toContain('Markdown2Social');

      const ogDescription = document.querySelector('meta[property="og:description"]');
      expect(ogDescription).toBeInTheDocument();

      const ogUrl = document.querySelector('meta[property="og:url"]');
      expect(ogUrl).toBeInTheDocument();

      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage).toBeInTheDocument();
    });

    it('should create Twitter Card meta tags', () => {
      render(<SEO platform="default" />);

      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      expect(twitterTitle).toBeInTheDocument();

      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      expect(twitterDescription).toBeInTheDocument();

      const twitterImage = document.querySelector('meta[property="twitter:image"]');
      expect(twitterImage).toBeInTheDocument();
    });
  });

  describe('canonical link', () => {
    it('should create canonical link tag', () => {
      render(<SEO platform="linkedin" />);

      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink).toBeInTheDocument();
      expect(canonicalLink?.getAttribute('href')).toContain('linkedin');
    });

    it('should use root URL for default platform', () => {
      render(<SEO platform="default" />);

      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink).toBeInTheDocument();
      const href = canonicalLink?.getAttribute('href') || '';
      expect(href.endsWith('/')).toBe(true);
      expect(href).not.toContain('default');
    });
  });

  describe('structured data', () => {
    it('should create WebApplication JSON-LD script', () => {
      render(<SEO platform="default" />);

      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      expect(jsonLdScript).toBeInTheDocument();

      const data = JSON.parse(jsonLdScript!.textContent || '{}');
      expect(data['@type']).toBe('WebApplication');
      expect(data.name).toBe('Markdown2Social');
    });

    it('should create FAQ structured data for default platform', () => {
      render(<SEO platform="default" />);

      const faqScript = document.querySelector('script[data-seo-faq="true"]');
      expect(faqScript).toBeInTheDocument();

      const faqData = JSON.parse(faqScript!.textContent || '{}');
      expect(faqData['@type']).toBe('FAQPage');
      expect(faqData.mainEntity).toBeInstanceOf(Array);
      expect(faqData.mainEntity.length).toBeGreaterThan(0);
    });

    it('should not create FAQ structured data for non-default platforms', () => {
      // First render with default
      const { unmount } = render(<SEO platform="default" />);

      // Unmount and render with linkedin
      unmount();
      document.querySelectorAll('[data-seo-dynamic="true"]').forEach((el) => el.remove());

      render(<SEO platform="linkedin" />);

      const faqScript = document.querySelector('script[data-seo-faq="true"]');
      expect(faqScript).not.toBeInTheDocument();
    });

    it('should create breadcrumb structured data', () => {
      render(<SEO platform="linkedin" />);

      const breadcrumbScript = document.querySelector('script[data-seo-breadcrumb="true"]');
      expect(breadcrumbScript).toBeInTheDocument();

      const breadcrumbData1 = JSON.parse(breadcrumbScript!.textContent || '{}');
      expect(breadcrumbData1['@type']).toBe('BreadcrumbList');
      expect(breadcrumbData1.itemListElement).toBeInstanceOf(Array);
    });

    it('should have correct breadcrumb structure for home page', () => {
      render(<SEO platform="default" />);

      const breadcrumbScript = document.querySelector('script[data-seo-breadcrumb="true"]');
      expect(breadcrumbScript).toBeInTheDocument();

      const breadcrumbData2 = JSON.parse(breadcrumbScript!.textContent || '{}');
      expect(breadcrumbData2.itemListElement).toHaveLength(1);
      expect(breadcrumbData2.itemListElement[0].name).toBe('Home');
    });

    it('should have correct breadcrumb structure for platform pages', () => {
      render(<SEO platform="twitter" />);

      const breadcrumbScript = document.querySelector('script[data-seo-breadcrumb="true"]');
      expect(breadcrumbScript).toBeInTheDocument();

      const breadcrumbData3 = JSON.parse(breadcrumbScript!.textContent || '{}');
      expect(breadcrumbData3.itemListElement).toHaveLength(2);
      expect(breadcrumbData3.itemListElement[0].name).toBe('Home');
      expect(breadcrumbData3.itemListElement[1].name).toBe('Twitter/X');
    });
  });

  describe('cleanup', () => {
    it('should mark dynamically created elements with data-seo-dynamic', () => {
      render(<SEO platform="linkedin" />);

      const dynamicElements = document.querySelectorAll('[data-seo-dynamic="true"]');
      expect(dynamicElements.length).toBeGreaterThan(0);
    });

    it('should remove old elements when platform changes', () => {
      const { rerender } = render(<SEO platform="linkedin" />);

      // Count elements before change
      const initialCount = document.querySelectorAll('[data-seo-dynamic="true"]').length;
      expect(initialCount).toBeGreaterThan(0);

      // Change platform
      rerender(<SEO platform="twitter" />);

      // Should have cleaned up and created new elements
      const elements = document.querySelectorAll('[data-seo-dynamic="true"]');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('component rendering', () => {
    it('should render nothing visible', () => {
      const { container } = render(<SEO platform="default" />);

      // Component should return null
      expect(container.firstChild).toBeNull();
    });
  });
});
