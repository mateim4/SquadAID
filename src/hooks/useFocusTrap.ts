/**
 * @file useFocusTrap.ts
 * @description Custom hook for managing focus trap within a container.
 * Ensures keyboard users can navigate within modals and dialogs without
 * losing focus to background content.
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive?: boolean;
  /** Element to return focus to when trap is deactivated */
  returnFocusRef?: React.RefObject<HTMLElement>;
  /** Whether to auto-focus the first focusable element */
  autoFocus?: boolean;
  /** Initial element to focus (selector or ref) */
  initialFocus?: string | React.RefObject<HTMLElement>;
}

/**
 * Custom hook for trapping focus within a container element.
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const { containerRef } = useFocusTrap({ isActive: isOpen });
 *   
 *   return (
 *     <div ref={containerRef} role="dialog">
 *       <button>First focusable</button>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isActive = true,
  returnFocusRef,
  autoFocus = true,
  initialFocus,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => {
      // Filter out hidden elements
      return (
        el.offsetParent !== null &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    });
  }, []);

  /**
   * Focus the first element or specified initial focus element
   */
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    // Try initial focus first
    if (initialFocus) {
      if (typeof initialFocus === 'string') {
        const element = containerRef.current.querySelector<HTMLElement>(initialFocus);
        if (element) {
          element.focus();
          return;
        }
      } else if (initialFocus.current) {
        initialFocus.current.focus();
        return;
      }
    }

    // Fall back to first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the container itself
      containerRef.current.setAttribute('tabindex', '-1');
      containerRef.current.focus();
    }
  }, [getFocusableElements, initialFocus]);

  /**
   * Handle tab key to trap focus
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab from first element goes to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab from last element goes to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [getFocusableElements, isActive]
  );

  // Store previous active element and set initial focus
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      if (autoFocus) {
        // Small delay to ensure container is rendered
        requestAnimationFrame(() => {
          focusFirst();
        });
      }
    }
  }, [isActive, autoFocus, focusFirst]);

  // Add and remove keyboard event listener
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isActive, handleKeyDown]);

  // Return focus when deactivated
  useEffect(() => {
    return () => {
      if (previousActiveElement.current && !isActive) {
        // Return focus to the specified element or previous active element
        const returnTo = returnFocusRef?.current || previousActiveElement.current;
        if (returnTo && typeof returnTo.focus === 'function') {
          returnTo.focus();
        }
      }
    };
  }, [isActive, returnFocusRef]);

  return {
    containerRef,
    focusFirst,
    getFocusableElements,
  };
}

export default useFocusTrap;
