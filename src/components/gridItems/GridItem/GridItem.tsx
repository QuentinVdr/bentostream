import { CachedIframePortal } from '@/components/IframeCache/IframeCache';
import { useIframeRefresh } from '@/hooks/useIframeRefresh';
import { forwardRef, memo, useImperativeHandle, useRef, type ReactNode } from 'react';
import GridItemHeader from './GridItemHeader/GridItemHeader';

interface GridItemProps {
  title: string;
  iframeSrc: string;
  allowFullScreen?: boolean;
  streamName?: string;
  onRefresh?: () => void;
  children?: ReactNode;
  cacheKey: string;
}

export interface GridItemRef {
  refreshIframe: () => void;
}

const GridItem = memo(
  forwardRef<GridItemRef, GridItemProps>(
    ({ title, iframeSrc, allowFullScreen, streamName, onRefresh, children, cacheKey }, ref) => {
      const { iframeRef, refreshIframe } = useIframeRefresh(onRefresh);
      const iframeContainerRef = useRef<HTMLDivElement>(null);

      useImperativeHandle(ref, () => ({ refreshIframe }), [refreshIframe]);

      return (
        <section
          className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
          aria-label={title}
        >
          <GridItemHeader title={title} streamName={streamName}>
            {children}
          </GridItemHeader>
          <div ref={iframeContainerRef} className="relative h-full w-full">
            <CachedIframePortal cacheKey={cacheKey} targetRef={iframeContainerRef}>
              <iframe
                ref={iframeRef}
                key={iframeSrc}
                title={title}
                src={iframeSrc}
                height="100%"
                width="100%"
                allowFullScreen={allowFullScreen}
                loading="lazy"
                className="transition-all duration-300 ease-in-out group-hover:mt-12"
                style={{ transform: 'translateZ(0)' }}
              />
            </CachedIframePortal>
          </div>
        </section>
      );
    }
  )
);

GridItem.displayName = 'GridItem';

export default GridItem;
