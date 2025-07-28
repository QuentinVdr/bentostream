import { memo, useMemo, useState } from 'react';

interface StreamGridItemProps {
  streamName: string;
  isChat?: boolean;
  isDarkThemePreferred?: boolean;
}

const StreamGridItem = memo(({ streamName, isChat = false, isDarkThemePreferred = false }: StreamGridItemProps) => {
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const title = useMemo(() => (isChat ? `Chat: ${streamName}` : `Stream: ${streamName}`), [isChat, streamName]);

  const iframeSrc = useMemo(() => {
    if (isChat) {
      const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
      return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
    }
    return `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;
  }, [streamName, isChat, isDarkThemePreferred]);

  return (
    <div
      className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
      onMouseLeave={() => setIsTitleHovered(false)}
    >
      <div
        className="title-overlay absolute z-10 w-full origin-top scale-y-0 transform-gpu transition-transform duration-300 ease-in-out group-hover:scale-y-100 hover:z-20"
        onMouseEnter={() => setIsTitleHovered(true)}
      >
        <h2 className="bg-zinc-900 px-4 py-2 text-center text-base font-semibold text-white backdrop-blur-sm">
          {title}
        </h2>
      </div>
      <iframe
        title={title}
        src={iframeSrc}
        height="100%"
        width="100%"
        allowFullScreen={!isChat}
        loading="lazy"
        className={`transition-all duration-300 ease-in-out ${isTitleHovered ? 'mt-8' : ''}`}
      />
    </div>
  );
});

StreamGridItem.displayName = 'StreamGridItem';

export default StreamGridItem;
