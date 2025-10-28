import { useIframeRefresh } from '@/hooks/useIframeRefresh';
import { memo, useImperativeHandle, type ReactNode, type Ref } from 'react';
import GridItemHeader from './GridItemHeader/GridItemHeader';

interface GridItemProps {
  title: string;
  iframeSrc: string;
  allowFullScreen?: boolean;
  streamName?: string;
  onRefresh?: () => void;
  children?: ReactNode;
  ref?: Ref<GridItemRef>;
}

export interface GridItemRef {
  refreshIframe: () => void;
}

const GridItem = memo(({ title, iframeSrc, allowFullScreen, streamName, onRefresh, children, ref }: GridItemProps) => {
  const { iframeRef, refreshIframe } = useIframeRefresh(onRefresh);

  useImperativeHandle(ref, () => ({ refreshIframe }), [refreshIframe]);

  return (
    <section
      className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
      aria-label={title}
    >
      <GridItemHeader title={title} streamName={streamName}>
        {children}
      </GridItemHeader>
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
    </section>
  );
});

GridItem.displayName = 'GridItem';

export default GridItem;
