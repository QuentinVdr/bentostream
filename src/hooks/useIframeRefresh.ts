import { useEffect, useRef } from 'react';

export function useIframeRefresh(onRefresh?: () => void) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshIframe = () => {
    const node = iframeRef.current;
    if (!node) {
      onRefresh?.();
      return;
    }
    const currentSrc = node.src;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    node.src = 'about:blank';
    timeoutRef.current = setTimeout(() => {
      if (node.isConnected) {
        node.src = currentSrc;
      }
      timeoutRef.current = null;
    }, 100);

    onRefresh?.();
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { iframeRef, refreshIframe };
}
