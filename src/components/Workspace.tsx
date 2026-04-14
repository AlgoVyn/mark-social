import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toolbar } from './Toolbar';
import { MarkdownEditor } from './MarkdownEditor';
import { LivePreview } from './LivePreview';
import { CharacterCounter } from './CharacterCounter';
import { StyleModal } from './StyleModal';
import { HistoryModal } from './HistoryModal';
import { ToastContainer } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { SEO } from './SEO';
import { markdownToSocialText } from '../utils/markdownParser';
import { PLATFORM_CONFIGS } from '../utils/platforms';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import './Workspace.css';

interface WorkspaceProps {
  initialPlatform?: string;
}

// Custom hook that safely uses navigate or returns a no-op
const useSafeNavigate = () => {
  try {
    return useNavigate();
  } catch {
    // Return no-op if not in Router context (e.g., during tests)
    return () => {};
  }
};

// Platform-specific default markdown templates
const PLATFORM_TEMPLATES: Record<string, string> = {
  linkedin: `# Welcome to Markdown2Social 👋

**Markdown2Social** converts your Markdown into perfectly formatted posts for LinkedIn and other social platforms.

## ✨ What You Can Do

**Format Text:** Use **bold**, _italic_, or ~strikethrough~ to emphasize your message

**Create Lists:**
- Organize ideas with bullet points
- Number steps for clarity
- Nest items for hierarchy

**Add Links:** Share [valuable resources](https://example.com) with clickable URLs

**Insert Code:** Use \`inline code\` for technical terms

## 📊 Character Count

Watch the live counter (LinkedIn limit: **3,000 characters**) as you write. Stay within limits effortlessly!

## 🚀 How to Use

1. Write your content in this editor using Markdown
2. See the live preview on the right
3. Click **Copy** to get formatted text
4. Paste directly into LinkedIn

---

*Start writing your professional post above...*`,

  twitter: `# Markdown2Social 🐦

Convert **Markdown** to perfect _Twitter/X_ posts!

## Features:
- **Bold** & _italic_ formatting
- Character counter (280 limit)
- Thread preview for long posts
- One-click copy

## Formatting Guide:
**Bold:** \`**text**\`
_Italic_: \`_text_\`
~Strikethrough~: \`~text~\`

Write your tweet here... 🚀`,

  instagram: `# Markdown2Social 📸

Transform **Markdown** into beautiful Instagram captions!

## What You Get:
- **Bold** text for emphasis
- _Italic_ for style
- Clean formatting
- 2,200 character counter

## Formatting:
\`**Bold**\` → **Bold**
\`_Italic_\` → _Italic_
\`~Strikethrough~\` → ~Strikethrough~

Write your caption here... ✨`,

  threads: `# Markdown2Social 🧵

Write **formatted** posts for Threads!

## Features:
- **Bold** & _italic_ text
- 500 character limit tracking
- Live preview
- One-click copy

## Markdown Tips:
\`**Bold**\` = **Bold**
\`_Italic_\` = _Italic_
\`~Strikethrough~\` = ~Strikethrough~

Share your thoughts... 💭`,

  mastodon: `# Markdown2Social 🐘

Create **formatted** toots for Mastodon!

## What It Does:
- Converts Markdown to formatted text
- **Bold** and _italic_ support
- 500 character counter
- Fediverse-ready formatting

## How to Format:
\`**Bold**\` → **Bold**
\`_Italic_\` → _Italic_
\`~Strikethrough~\` → ~Strikethrough~

Write your toot here... 🦣`,

  bluesky: `# Markdown2Social ☁️

Format posts for **Bluesky** with ease!

## Features:
- **Bold** & _italic_ formatting
- 300 character limit tracker
- AT Protocol optimized
- Live preview

## Quick Format:
\`**Bold**\` = **Bold**
\`_Italic_\` = _Italic_

Keep it under 300 characters! 📝`,

  discord: `# Markdown2Social 💬

Perfect **Discord** formatting from Markdown!

## Supported Formatting:
- **Bold**: \`**text**\`
- _Italic_: \`_text_\`
- \`Code\`: \`\`code\`\`
- ~Strikethrough~: \`~text~\`

## Features:
- 2,000 character limit
- Code block support
- Live preview
- Instant copy

Write your message...`,

  reddit: `# Markdown2Social - Reddit Edition

Create perfectly **formatted** Reddit posts!

## Formatting Support:
- **Bold** with \`**text**\`
- _Italic_ with \`_text_\`
- ~Strikethrough~ with \`~text~\`
- \`Code\` with backticks
- Lists and links

## Why Use It:
- 40,000 character limit
- Preview before posting
- One-click copy
- Clean formatting

Write your post content here...`,

  youtube: `# Markdown2Social - YouTube Descriptions

Format your **video descriptions** perfectly!

## Features:
- **Bold** section headers
- _Italic_ emphasis
- Timestamps support
- 5,000 character limit

## Example Timestamps:
**Video Chapters:**
00:00 Intro
01:30 Main Content
05:45 Key Points
10:00 Conclusion

## Formatting:
\`**Bold**\` → **Bold**
\`_Italic_\` → _Italic_

Write your description here...`,

  facebook: `# Markdown2Social - Facebook Posts

Create engaging **Facebook** posts with proper formatting!

## Format Your Content:
- **Bold** text for emphasis
- _Italic_ for style
- ~Strikethrough~ for corrections
- Lists for organization

## Facebook Features:
- 63,206 character limit
- Link previews supported
- Hashtag friendly
- Perfect for long-form posts

## Quick Format:
\`**Bold**\` → **Bold**
\`_Italic_\` → _Italic_
\`~Strikethrough~\` → ~Strikethrough~

Write your Facebook post here...`,

  tiktok: `# Markdown2Social - TikTok Captions

Create catchy **TikTok** captions with formatting!

## What You Get:
- **Bold** text to stand out
- _Italic_ for emphasis
- 2,200 character limit
- Hashtag support

## Perfect For:
- Video descriptions
- Caption formatting
- Call-to-action text
- Trending hashtags

## Formatting Guide:
\`**Bold**\` = **Bold**
\`_Italic_\` = _Italic_
\`~Strikethrough~\` = ~Strikethrough~

Create your caption here...`,

  telegram: `# Markdown2Social - Telegram Messages

Format **Telegram** messages with Markdown!

## Supported Formatting:
- **Bold** text: \`**text**\`
- _Italic_ text: \`_text_\`
- \`Code\` snippets: \`\`code\`\`
- ~Strikethrough~: \`~text~\`

## Features:
- 4,096 character limit
- Bot-friendly formatting
- Channel post support
- Group message ready

## Perfect For:
- Channel announcements
- Bot messages
- Group discussions
- Formatted updates

Write your Telegram message here...`,
};

export const Workspace: React.FC<WorkspaceProps> = ({ initialPlatform = 'default' }) => {
  const navigate = useSafeNavigate();
  // For 'default', use linkedin as the actual platform but SEO will handle it differently
  const actualPlatform = initialPlatform === 'default' ? 'linkedin' : initialPlatform;
  const platformConfig = PLATFORM_CONFIGS[actualPlatform];
  const validPlatform = platformConfig ? actualPlatform : 'linkedin';

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [markdown, setMarkdown] = useState<string>(() => {
    // Use platform-specific template or default
    return (
      PLATFORM_TEMPLATES[validPlatform] ||
      PLATFORM_TEMPLATES.linkedin ||
      PLATFORM_TEMPLATES.linkedin
    );
  });
  const [platform, setPlatformState] = useState<string>(validPlatform);
  // For SEO, use initialPlatform to differentiate home page from linkedin page
  const seoPlatform = initialPlatform === 'default' ? 'default' : platform;
  const [formatStyle, setFormatStyle] = useState<string>('standard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const { drafts, saveDraft, loadError, clearLoadError } = useHistory();
  const { toasts, addToast, removeToast } = useToast();

  // Sync platform with URL when initialPlatform changes (from route)
  useEffect(() => {
    const newValidPlatform = PLATFORM_CONFIGS[initialPlatform] ? initialPlatform : 'linkedin';
    if (newValidPlatform !== platform) {
      setPlatformState(newValidPlatform);
    }
  }, [initialPlatform, platform]);

  // Memoize the parsed markdown to avoid recomputation
  const socialPreview = useMemo(() => {
    return markdownToSocialText(markdown, formatStyle);
  }, [markdown, formatStyle]);

  useEffect(() => {
    // Auto-save debounced roughly
    const timeout = setTimeout(() => {
      saveDraft(markdown);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [markdown, saveDraft]);

  // Show toast when localStorage error occurs
  useEffect(() => {
    if (loadError) {
      addToast(loadError, 'error');
      clearLoadError();
    }
  }, [loadError, clearLoadError, addToast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // Handle platform change - update state and navigate to new URL
  const setPlatform = (newPlatform: string) => {
    setPlatformState(newPlatform);
    // Navigate to the platform-specific route
    navigate(`/${newPlatform}`);
  };

  const handleCopy = useCallback(async () => {
    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      addToast('Clipboard API not available in your browser', 'error');
      return;
    }

    setIsCopying(true);

    try {
      // Use the memoized socialPreview value instead of recalculating
      await navigator.clipboard.writeText(socialPreview);
      const config = PLATFORM_CONFIGS[platform];
      addToast(
        `Copied to clipboard! Paste into ${config?.name || 'social media'} to see formatted content.`,
        'success'
      );
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    } finally {
      // Small delay to show loading state feedback
      setTimeout(() => setIsCopying(false), 300);
    }
  }, [socialPreview, addToast, platform]);

  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  const handleOpenHistory = useCallback(() => {
    setIsLoadingHistory(true);
    // Simulate loading for better UX feedback
    setTimeout(() => {
      setIsLoadingHistory(false);
      setIsHistoryOpen(true);
    }, 150);
  }, []);

  const handleLoadDraft = useCallback(
    (draft: { markdown: string }) => {
      setIsLoadingHistory(true);
      setMarkdown(draft.markdown);
      setIsHistoryOpen(false);
      addToast('Draft loaded successfully', 'success');
      setTimeout(() => setIsLoadingHistory(false), 200);
    },
    [addToast]
  );

  return (
    <>
      <SEO platform={seoPlatform} />
      <main className="workspace" role="main" aria-label="Markdown to Social converter workspace">
        <a href="#markdown-editor" className="skip-link">
          Skip to editor
        </a>
        <Toolbar
          onCopy={handleCopy}
          onOpenSettings={handleOpenSettings}
          onOpenHistory={handleOpenHistory}
          platform={platform}
          setPlatform={setPlatform}
          theme={theme}
          toggleTheme={toggleTheme}
          isCopying={isCopying}
          isLoadingHistory={isLoadingHistory}
        />
        <div className="workspace-panes">
          <div className="pane left-pane">
            <MarkdownEditor
              value={markdown}
              onChange={setMarkdown}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>
          <div className="pane right-pane">
            <ErrorBoundary
              fallback={
                <div className="error-boundary" role="alert">
                  <h2>Preview Error</h2>
                  <p>Unable to render preview. Please check your markdown syntax.</p>
                </div>
              }
            >
              <LivePreview contentText={socialPreview} platform={platform} />
              <CharacterCounter text={socialPreview} platform={platform} />
            </ErrorBoundary>
          </div>
        </div>
        <StyleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formatStyle={formatStyle}
          setFormatStyle={setFormatStyle}
        />
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          drafts={drafts}
          onLoadDraft={handleLoadDraft}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </main>
    </>
  );
};
