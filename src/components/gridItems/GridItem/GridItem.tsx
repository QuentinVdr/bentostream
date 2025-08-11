import { memo, type ReactNode } from 'react';
import GridItemHeader from '../GridItemHeader/GridItemHeader';

interface GridItemProps {
  title: string;
  iframeSrc: string;
  allowFullScreen?: boolean;
  headerActions?: ReactNode;
  streamName?: string;
}

const GridItem = memo(({ title, iframeSrc, allowFullScreen, headerActions, streamName }: GridItemProps) => {
  return (
    <section
      className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
      aria-label={title}
    >
      <GridItemHeader title={title} streamName={streamName}>
        {headerActions}
      </GridItemHeader>
      <iframe
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
