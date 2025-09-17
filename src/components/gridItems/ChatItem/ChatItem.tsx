import { memo } from 'react';
import GridItem from '../GridItem/GridItem';
import ChatItemHeader from './ChatItemHeader/ChatItemHeader';

interface ChatItemProps {
  streamName: string;
  isDarkThemePreferred?: boolean;
}

const ChatItem = memo(
  ({ streamName, isDarkThemePreferred = false }: ChatItemProps) => {
    const title = `Chat: ${streamName}`;
    const iframeSrc = `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${isDarkThemePreferred ? '&darkpopout' : ''}`;

    return (
      <GridItem title={title} iframeSrc={iframeSrc} streamName={streamName}>
        <ChatItemHeader streamName={streamName} />
      </GridItem>
    );
  },
  (prev, next) =>
    prev.isDarkThemePreferred === next.isDarkThemePreferred &&
    prev.streamName.toLowerCase() === next.streamName.toLowerCase()
);

ChatItem.displayName = 'ChatItem';

export default ChatItem;
