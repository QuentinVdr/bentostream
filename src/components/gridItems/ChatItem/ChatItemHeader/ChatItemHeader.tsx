import Dropdown from '@/components/global/Dropdown/Dropdown';
import { useStreamStore } from '@/stores/streamStore';

interface ChatItemHeaderProps {
  streamName: string;
}

const ChatItemHeader = ({ streamName }: ChatItemHeaderProps) => {
  const { changeChat, streams, removeChat } = useStreamStore();

  const chatDropdownItems = streams
    .filter(s => s !== streamName)
    .map(streamer => ({
      id: streamer,
      label: streamer,
      onClick: () => changeChat(streamer),
    }));

  return (
    <>
      <Dropdown buttonLabel="Switch Chat" items={chatDropdownItems} />
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={() => removeChat(streamName)}
        className="ml-auto hover:text-red-600"
        aria-label={`Remove chat ${streamName}`}
        title="Remove chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </>
  );
};

ChatItemHeader.displayName = 'ChatItemHeader';

export default ChatItemHeader;
