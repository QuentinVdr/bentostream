import { forwardRef, memo, useImperativeHandle, useRef, type ReactNode } from 'react';
import GridItemHeader from '../GridItemHeader/GridItemHeader';

interface GridItemProps {
  title: string;
  iframeSrc: string;
  allowFullScreen?: boolean;
  headerActions?: ReactNode;
  streamName?: string;
  onRefresh?: () => void;
}

export interface GridItemRef {
  refreshIframe: () => void;
}

const GridItem = memo(
  forwardRef<GridItemRef, GridItemProps>(
    ({ title, iframeSrc, allowFullScreen, headerActions, streamName, onRefresh }, ref) => {
      const iframeRef = useRef<HTMLIFrameElement>(null);

      const refreshIframe = () => {
        if (iframeRef.current) {
          const currentSrc = iframeRef.current.src;
          iframeRef.current.src = '';
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.src = currentSrc;
            }
          }, 100);
        }
        onRefresh?.();
      };

      useImperativeHandle(ref, () => ({
        refreshIframe,
      }));

      return (
        <section
          className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
          aria-label={title}
        >
          <GridItemHeader title={title} streamName={streamName}>
            {headerActions}
          </GridItemHeader>
          <iframe
            ref={iframeRef}
            title={title}
            src={iframeSrc}
            height="100%"
            width="100%"
            allowFullScreen={allowFullScreen}
            loading="lazy"
            className="transition-all duration-300 ease-in-out group-hover:mt-12"
            style={{ transform: 'translateZ(0)' }}
          />
        </section>
      );
    }
  )
);

GridItem.displayName = 'GridItem';

export default GridItem;
