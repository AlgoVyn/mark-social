import { useEffect, useRef, useCallback } from 'react';

interface UseModalAccessibilityProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UseModalAccessibilityReturn {
  modalRef: React.RefObject<HTMLDivElement>;
  focusFirstElement: () => void;
  focusLastElement: () => void;
}

/**
 * Custom hook for managing modal accessibility
 * - Traps focus within the modal
 * - Restores focus to the trigger element on close
 * - Handles Escape key to close modal
 * - Sets initial focus to the first focusable element
 */
export function useModalAccessibility({
  isOpen,
  onClose,
}: UseModalAccessibilityProps): UseModalAccessibilityReturn {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  /**
   * Gets all focusable elements within the modal
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!modalRef.current) return [];

    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(modalRef.current.querySelectorAll<HTMLElement>(selector)).filter((el) => {
      // Filter out hidden elements
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }, []);

  /**
   * Focuses the first focusable element in the modal
   */
  const focusFirstElement = useCallback(() => {
    const elements = getFocusableElements();
    const firstElement = elements[0];
    if (firstElement) {
      firstElement.focus();
    }
  }, [getFocusableElements]);

  /**
   * Focuses the last focusable element in the modal
   */
  const focusLastElement = useCallback(() => {
    const elements = getFocusableElements();
    const lastElement = elements[elements.length - 1];
    if (lastElement) {
      lastElement.focus();
    }
  }, [getFocusableElements]);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Update focusable elements list
      focusableElementsRef.current = getFocusableElements();
    }
  }, [isOpen, getFocusableElements]);

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Small delay to ensure modal is rendered and focusable elements are available
    const focusTimeout = setTimeout(() => {
      focusFirstElement();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const elements = getFocusableElements();
      const firstFocusable = elements[0];
      const lastFocusable = elements[elements.length - 1];

      if (!firstFocusable || !lastFocusable) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);

      // Restore focus when modal closes
      // Use setTimeout to ensure focus restoration happens after modal is removed from DOM
      setTimeout(() => {
        if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
          previousFocusRef.current.focus();
        }
      }, 0);
    };
  }, [isOpen, onClose, focusFirstElement, getFocusableElements]);

  return { modalRef, focusFirstElement, focusLastElement };
}
