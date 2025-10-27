import Dropdown from '@/components/global/Dropdown/Dropdown';
import { useStreamStore } from '@/stores/streamStore';

interface StreamItemHeaderProps {
  streamName: string;
  handleRefresh: () => void;
}

const StreamItemHeader = ({ streamName, handleRefresh }: StreamItemHeaderProps) => {
  const { swapStreamsByName, streams } = useStreamStore();

  const handleStreamSwap = (targetStreamName: string) => {
    swapStreamsByName(streamName, targetStreamName);
  };

  const swapDropdownItems = streams
    .filter(s => s !== streamName)
    .map(targetStream => ({
      id: targetStream,
      label: `Swap with ${targetStream}`,
      onClick: () => handleStreamSwap(targetStream),
    }));

  return (
    <>
      <Dropdown key={`swap-${streamName}-${streams.join('-')}`} buttonLabel="Swap" items={swapDropdownItems} />
      <button
        type="button"
        aria-label="Refresh stream"
        title="Refresh stream"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          handleRefresh();
        }}
        className="ml-auto hover:text-purple-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </>
  );
};

StreamItemHeader.displayName = 'StreamItemHeader';

export default StreamItemHeader;
