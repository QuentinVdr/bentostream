import debounce from '@/utils/DebounceUtils';
import { useEffect, useState } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
  hasVerticalScrollbar: boolean;
  hasHorizontalScrollbar: boolean;
}

interface UseWindowDimensionsOptions {
  debounceMs?: number;
  scrollbarWidth?: number;
}

const getScrollbarWidth = (): number => {
  // Return 0 for SSR or when document.body is not available
  if (typeof document === 'undefined' || !document.body) {
    return 0;
  }
  // Create a temporary element to measure scrollbar width
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  outer.style.width = '50px';
  outer.style.height = '50px';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (outer.style as any).msOverflowStyle = 'scrollbar';

  document.body.appendChild(outer);

  const inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '100%';
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
};

const detectScrollbars = () => {
  const hasVerticalScrollbar = document.documentElement.scrollHeight > window.innerHeight;
  const hasHorizontalScrollbar = document.documentElement.scrollWidth > window.innerWidth;

  return {
    hasVerticalScrollbar,
    hasHorizontalScrollbar,
  };
};

export const useWindowDimensions = ({
  debounceMs = 300,
  scrollbarWidth,
}: UseWindowDimensionsOptions = {}): WindowDimensions => {
  // Calculate scrollbar width once on mount if not provided
  const actualScrollbarWidth = scrollbarWidth ?? getScrollbarWidth();

  const [dimensions, setDimensions] = useState<WindowDimensions>(() => {
    const { hasVerticalScrollbar, hasHorizontalScrollbar } = detectScrollbars();

    return {
      width: window.innerWidth - (hasVerticalScrollbar ? actualScrollbarWidth : 0),
      height: window.innerHeight - (hasHorizontalScrollbar ? actualScrollbarWidth : 0),
      hasVerticalScrollbar,
      hasHorizontalScrollbar,
    };
  });

  const updateDimensions = debounce(() => {
    const { hasVerticalScrollbar, hasHorizontalScrollbar } = detectScrollbars();

    setDimensions({
      width: window.innerWidth - (hasVerticalScrollbar ? actualScrollbarWidth : 0),
      height: window.innerHeight - (hasHorizontalScrollbar ? actualScrollbarWidth : 0),
      hasVerticalScrollbar,
      hasHorizontalScrollbar,
    });
  }, debounceMs);

  useEffect(() => {
    // Listen for both resize and scroll events
    const handleResize = () => updateDimensions();
    const handleScroll = () => updateDimensions();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also listen for DOM changes that might affect scrollbars
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      updateDimensions.cancel();
    };
  }, [updateDimensions]);

  return dimensions;
};

export default useWindowDimensions;
