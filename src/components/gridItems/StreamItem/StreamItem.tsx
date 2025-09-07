import { useCallback, useRef } from 'react';
import GridItem, { type GridItemRef } from '../GridItem/GridItem';
import StreamItemHeader from './StreamItemHeader/StreamItemHeader';

interface StreamItemProps {
  streamName: string;
}

const StreamItem = ({ streamName }: StreamItemProps) => {
  const gridItemRef = useRef<GridItemRef>(null);

  const title = `Stream: ${streamName}`;

  const iframeSrc = `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;

  const handleRefresh = useCallback(() => {
    gridItemRef.current?.refreshIframe();
  }, []);

  return (
    <GridItem ref={gridItemRef} title={title} iframeSrc={iframeSrc} allowFullScreen streamName={streamName}>
      <StreamItemHeader streamName={streamName} handleRefresh={handleRefresh} />
    </GridItem>
  );
};

StreamItem.displayName = 'StreamItem';

export default StreamItem;
