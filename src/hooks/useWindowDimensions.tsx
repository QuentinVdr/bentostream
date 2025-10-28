import debounce from '@/utils/DebounceUtils';
import { useEffect, useState } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

interface UseWindowDimensionsOptions {
  debounceMs?: number;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

const getWindowDimensions = (): WindowDimensions => {
  if (!isBrowser) {
    return { width: 0, height: 0 };
  }

  // Use clientWidth to exclude vertical scrollbar width
  return {
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  };
};

export const useWindowDimensions = ({ debounceMs = 16 }: UseWindowDimensionsOptions = {}): WindowDimensions => {
  const [dimensions, setDimensions] = useState<WindowDimensions>(getWindowDimensions);

  useEffect(() => {
    if (!isBrowser) return;

    const updateDimensions = debounce(() => {
      setDimensions(getWindowDimensions());
    }, debounceMs);

    // Listen for window resize
    window.addEventListener('resize', updateDimensions);

    // Create a ResizeObserver to watch for changes in document size
    // This catches when scrollbars appear/disappear due to content changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    // Observe the documentElement (root html element) for size changes
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
      updateDimensions.cancel();
    };
  }, [debounceMs]);

  return dimensions;
};

export default useWindowDimensions;
