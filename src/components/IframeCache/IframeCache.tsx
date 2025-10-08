import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface IframeCacheContextValue {
  getIframeContainer: (key: string) => HTMLDivElement;
  releaseIframeContainer: (key: string) => void;
}

const IframeCacheContext = createContext<IframeCacheContextValue | null>(null);

export const useIframeCache = () => {
  const context = useContext(IframeCacheContext);
  if (!context) {
    throw new Error('useIframeCache must be used within IframeCacheProvider');
  }
  return context;
};

interface IframeCacheProviderProps {
  readonly children: ReactNode;
}

export function IframeCacheProvider({ children }: IframeCacheProviderProps) {
  const containerMapRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastUsedRef = useRef<Map<string, number>>(new Map());
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create hidden container for cached iframes
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.position = 'fixed';
    hiddenDiv.style.top = '-9999px';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.style.width = '0';
    hiddenDiv.style.height = '0';
    hiddenDiv.style.overflow = 'hidden';
    hiddenDiv.style.pointerEvents = 'none';
    document.body.appendChild(hiddenDiv);
    hiddenContainerRef.current = hiddenDiv;

    const cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

        for (const [key, lastUsed] of lastUsedRef.current.entries()) {
          if (now - lastUsed > CACHE_TTL) {
            const container = containerMapRef.current.get(key);
            container?.remove();
            containerMapRef.current.delete(key);
            lastUsedRef.current.delete(key);
          }
        }
      },
      5 * 60 * 1000
    );

    return () => {
      hiddenDiv.remove();
      clearInterval(cleanupInterval);
    };
  }, []);

  const getIframeContainer = useCallback((key: string): HTMLDivElement => {
    lastUsedRef.current.set(key, Date.now());
    if (!containerMapRef.current.has(key)) {
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      containerMapRef.current.set(key, container);
    }
    return containerMapRef.current.get(key)!;
  }, []);

  const releaseIframeContainer = useCallback((key: string) => {
    const container = containerMapRef.current.get(key);
    if (container) {
      // Move to hidden container to keep iframe alive
      hiddenContainerRef.current?.appendChild(container);
    }
  }, []);

  const value = useMemo(
    () => ({ getIframeContainer, releaseIframeContainer }),
    [getIframeContainer, releaseIframeContainer]
  );

  return <IframeCacheContext.Provider value={value}>{children}</IframeCacheContext.Provider>;
}

interface CachedIframePortalProps {
  cacheKey: string;
  targetRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export function CachedIframePortal({ cacheKey, targetRef, children }: CachedIframePortalProps) {
  const { getIframeContainer, releaseIframeContainer } = useIframeCache();
  const container = getIframeContainer(cacheKey);

  useEffect(() => {
    // Move container to target when mounted
    if (targetRef.current) {
      targetRef.current.appendChild(container);
    }

    return () => {
      // Release container when unmounted
      releaseIframeContainer(cacheKey);
    };
  }, [cacheKey, container, targetRef, releaseIframeContainer]);

  return createPortal(children, container);
}
