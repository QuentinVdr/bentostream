import { useCallback, useMemo } from 'react';
import { useStreamStore } from '../../../stores/streamStore';
import Dropdown from '../../global/Dropdown/Dropdown';
import GridItem from '../GridItem/GridItem';

interface ChatItemProps {
  streamName: string;
  isDarkThemePreferred?: boolean;
}

const ChatItem = ({ streamName, isDarkThemePreferred = false }: ChatItemProps) => {
  const { changeChatStreamer, streams } = useStreamStore();

  const title = `Chat: ${streamName}`;

  const iframeSrc = useMemo(() => {
    const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
    return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
  }, [streamName, isDarkThemePreferred]);

  const handleChatChange = useCallback(
    (newChatStreamer: string) => {
      changeChatStreamer(newChatStreamer);
    },
    [changeChatStreamer]
  );

  const availableChatStreamers = useMemo(() => streams.filter(s => s !== streamName), [streams, streamName]);

  const chatDropdownItems = useMemo(
    () =>
      availableChatStreamers.map(streamer => ({
        id: streamer,
        label: streamer,
        onClick: () => handleChatChange(streamer),
      })),
    [availableChatStreamers, handleChatChange]
  );

  return (
    <GridItem
      title={title}
      iframeSrc={iframeSrc}
      allowFullScreen={false}
      headerActions={
        <Dropdown key={`chat-${streamName}-${streams.join('-')}`} buttonLabel="Switch Chat" items={chatDropdownItems} />
      }
    />
  );
};

export default ChatItem;
