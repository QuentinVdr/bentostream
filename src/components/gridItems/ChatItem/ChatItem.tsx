import { useCallback, useMemo } from 'react';
import { useStreamStore } from '../../../stores/streamStore';
import Dropdown from '../../global/Dropdown/Dropdown';
import GridItem from '../GridItem/GridItem';

interface ChatItemProps {
  streamName: string;
  isDarkThemePreferred?: boolean;
}

const ChatItem = ({ streamName, isDarkThemePreferred = false }: ChatItemProps) => {
  const { changeChat, streams, removeChat } = useStreamStore();

  const title = `Chat: ${streamName}`;

  const iframeSrc = useMemo(() => {
    const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
    return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
  }, [streamName, isDarkThemePreferred]);

  const handleChatChange = useCallback(
    (newChat: string) => {
      changeChat(newChat);
    },
    [changeChat]
  );

  const availableChats = useMemo(() => streams.filter(s => s !== streamName), [streams, streamName]);

  const chatDropdownItems = useMemo(
    () =>
      availableChats.map(streamer => ({
        id: streamer,
        label: streamer,
        onClick: () => handleChatChange(streamer),
      })),
    [availableChats, handleChatChange]
  );

  return (
    <GridItem
      title={title}
      iframeSrc={iframeSrc}
      streamName={streamName}
      headerActions={
        <>
          <Dropdown
            key={`chat-${streamName}-${streams.join('-')}`}
            buttonLabel="Switch Chat"
            items={chatDropdownItems}
          />
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => removeChat(streamName)}
            className="ml-auto hover:text-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      }
    />
  );
};

export default ChatItem;
