import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils';
import { validateDrafts, sanitizeMarkdown, type ValidatedDraft } from '../utils/validation';

export type Draft = ValidatedDraft;

export interface UseHistoryReturn {
  drafts: Draft[];
  saveDraft: (markdown: string) => void;
  loadError: string | null;
  clearLoadError: () => void;
}

// Maximum number of drafts to keep in history
const MAX_DRAFTS = 20;

// Storage key for drafts
const STORAGE_KEY = 'marksocial-drafts';

/**
 * Custom hook for managing draft history in localStorage.
 *
 * Note: Size checking relies on the browser's actual quota enforcement
 * via try/catch, as localStorage limits vary by browser (typically 5-10MB total).
 * This approach is more reliable than pre-calculating size, which can be
 * inaccurate due to UTF-16 encoding, compression, and browser-specific storage mechanics.
 */
export function useHistory(): UseHistoryReturn {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = validateDrafts(parsed);

        if (validated) {
          // Apply additional sanitization to markdown content
          const sanitizedDrafts = validated.map((draft) => ({
            ...draft,
            markdown: sanitizeMarkdown(draft.markdown),
          }));
          setDrafts(sanitizedDrafts);
        } else {
          setLoadError('Saved drafts data is corrupted. History will reset on next save.');
        }
      }
    } catch {
      setLoadError('Failed to load saved drafts. Storage may be corrupted or unavailable.');
    }
  }, []);

  const saveDraft = useCallback((markdown: string) => {
    if (!markdown.trim()) return;

    setDrafts((prev) => {
      // Don't save if identical to most recent draft
      if (prev[0]?.markdown === markdown) return prev;

      const newDraft: Draft = {
        id: generateId(),
        markdown: sanitizeMarkdown(markdown),
        updatedAt: Date.now(),
      };

      // Keep only last N drafts
      const next = [newDraft, ...prev].slice(0, MAX_DRAFTS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setLoadError(null); // Clear any previous error on success
      } catch (e) {
        // localStorage is not available or quota exceeded
        let errorMsg: string;

        if (e instanceof Error) {
          if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
            errorMsg = 'Storage is full. Try clearing some old drafts or browser data.';
          } else if (e.name === 'SecurityError' || e.message.includes('secure')) {
            errorMsg = 'Storage access blocked. Check browser privacy settings.';
          } else {
            errorMsg = `Save failed: ${e.message}`;
          }
        } else {
          errorMsg = 'Storage unavailable or quota exceeded. Your draft was not saved.';
        }

        setLoadError(`Failed to save draft: ${errorMsg}`);
        console.warn('[useHistory] Failed to save draft to localStorage:', e);
      }

      // Always return next so UI reflects the draft even if storage failed
      return next;
    });
  }, []);

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  return { drafts, saveDraft, loadError, clearLoadError };
}
