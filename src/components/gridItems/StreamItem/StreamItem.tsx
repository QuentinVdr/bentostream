import { memo, useCallback, useMemo } from 'react';
import { useStreamStore } from '../../../stores/streamStore';
import Dropdown from '../../global/Dropdown/Dropdown';
import GridItem from '../GridItem/GridItem';

interface StreamItemProps {
  streamName: string;
}

const StreamItem = memo(({ streamName }: StreamItemProps) => {
  const { swapStreamsByName, getAvailableSwapStreams } = useStreamStore();

  const title = `Stream: ${streamName}`;

  const iframeSrc = `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;

  const handleStreamSwap = useCallback(
    (targetStreamName: string) => {
      swapStreamsByName(streamName, targetStreamName);
    },
    [swapStreamsByName, streamName]
  );

  const availableSwapStreams = useMemo(
    () => getAvailableSwapStreams(streamName),
    [getAvailableSwapStreams, streamName]
  );

  const swapDropdownItems = useMemo(
    () =>
      availableSwapStreams.map(targetStream => ({
        id: targetStream,
        label: `Swap with ${targetStream}`,
        onClick: () => handleStreamSwap(targetStream),
      })),
    [availableSwapStreams, handleStreamSwap]
  );

  return (
    <GridItem
      title={title}
      iframeSrc={iframeSrc}
      allowFullScreen={true}
      headerActions={<Dropdown buttonLabel="Swap" items={swapDropdownItems} />}
    />
  );
});

StreamItem.displayName = 'StreamItem';

export default StreamItem;
