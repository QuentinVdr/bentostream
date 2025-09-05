import { useCallback, useMemo, useRef } from 'react';
import { useStreamStore } from '../../../stores/streamStore';
import Dropdown from '../../global/Dropdown/Dropdown';
import GridItem, { type GridItemRef } from '../GridItem/GridItem';

interface StreamItemProps {
  streamName: string;
}

const StreamItem = ({ streamName }: StreamItemProps) => {
  const { swapStreamsByName, streams } = useStreamStore();
  const gridItemRef = useRef<GridItemRef>(null);

  const title = `Stream: ${streamName}`;

  const iframeSrc = `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;

  const handleStreamSwap = useCallback(
    (targetStreamName: string) => {
      swapStreamsByName(streamName, targetStreamName);
    },
    [swapStreamsByName, streamName]
  );

  const availableSwapStreams = useMemo(() => streams.filter(s => s !== streamName), [streams, streamName]);

  const swapDropdownItems = useMemo(
    () =>
      availableSwapStreams.map(targetStream => ({
        id: targetStream,
        label: `Swap with ${targetStream}`,
        onClick: () => handleStreamSwap(targetStream),
      })),
    [availableSwapStreams, handleStreamSwap]
  );

  const handleRefresh = useCallback(() => {
    gridItemRef.current?.refreshIframe();
  }, []);

  return (
    <GridItem
      ref={gridItemRef}
      title={title}
      iframeSrc={iframeSrc}
      allowFullScreen
      streamName={streamName}
      headerActions={
        <>
          <Dropdown key={`swap-${streamName}-${streams.join('-')}`} buttonLabel="Swap" items={swapDropdownItems} />
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={handleRefresh}
            className="ml-auto hover:text-purple-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </>
      }
    />
  );
};

export default StreamItem;
