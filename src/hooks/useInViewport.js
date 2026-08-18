import { useEffect, useState } from 'react';

/**
 * useInViewport(ref)
 * Tracks whether a DOM node is both scrolled into the viewport
 * (IntersectionObserver) and the browser tab is actually active (Page
 * Visibility API). Intended for gating always-on WebGL render loops —
 * no point spending GPU/battery animating a canvas nobody can see.
 */
export const useInViewport = (ref) => {
  const [inViewport, setInViewport] = useState(true);
  const [tabVisible, setTabVisible] = useState(
    typeof document === 'undefined' || document.visibilityState === 'visible'
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0, rootMargin: '150px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const onVisibilityChange = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return inViewport && tabVisible;
};
