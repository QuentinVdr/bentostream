import { useMemo } from 'react';
import GridItem from '../GridItem/GridItem';
import ChatItemHeader from './ChatItemHeader/ChatItemHeader';

interface ChatItemProps {
  streamName: string;
  isDarkThemePreferred?: boolean;
}

const ChatItem = ({ streamName, isDarkThemePreferred = false }: ChatItemProps) => {
  const title = `Chat: ${streamName}`;

  const iframeSrc = useMemo(() => {
    const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
    return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
  }, [streamName, isDarkThemePreferred]);

  return (
    <GridItem title={title} iframeSrc={iframeSrc} streamName={streamName}>
      <ChatItemHeader streamName={streamName} />
    </GridItem>
  );
};

ChatItem.displayName = 'ChatItem';

export default ChatItem;
