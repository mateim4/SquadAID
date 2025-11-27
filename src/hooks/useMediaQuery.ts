/**
 * useMediaQuery
 * A tiny hook that returns true when the given CSS media query matches.
 *
 * Example:
 *   const isMobile = useMediaQuery('(max-width: 700px)');
 */
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof matchMedia === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof matchMedia === 'undefined') return;
    const mq = window.matchMedia(query);
    const onChange = (ev: MediaQueryListEvent) => setMatches(ev.matches);
    // Sync initial (covers React strict mode mounts)
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
