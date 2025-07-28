import { memo, useMemo } from 'react';

interface StreamGridItemProps {
  streamName: string;
  isChat?: boolean;
  isDarkThemePreferred?: boolean;
}

const StreamGridItem = memo(({ streamName, isChat = false, isDarkThemePreferred = false }: StreamGridItemProps) => {
  // Memoize iframe src to prevent unnecessary re-renders
  const iframeSrc = useMemo(() => {
    if (isChat) {
      const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
      return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
    }
    return `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;
  }, [streamName, isChat, isDarkThemePreferred]);

  const title = useMemo(
    () => (isChat ? `Twitch Chat: ${streamName}` : `Twitch Stream: ${streamName}`),
    [isChat, streamName]
  );

  const headerText = useMemo(() => (isChat ? `Chat: ${streamName}` : `Stream: ${streamName}`), [isChat, streamName]);

  return (
    <div className="flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900">
      <div>
        <h2 className="text-center text-base font-semibold">{headerText}</h2>
      </div>
      <iframe title={title} src={iframeSrc} height="100%" width="100%" allowFullScreen={!isChat} loading="lazy" />
    </div>
  );
});

StreamGridItem.displayName = 'StreamGridItem';

export default StreamGridItem;
