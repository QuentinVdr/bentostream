import { memo, useMemo } from 'react';
import { useStreamStore } from '../../stores/streamStore';

interface StreamGridItemProps {
  streamName: string;
  isChat?: boolean;
  isDarkThemePreferred?: boolean;
}

const StreamGridItem = memo(({ streamName, isChat = false, isDarkThemePreferred = false }: StreamGridItemProps) => {
  const { swapStreamsByName, changeChatStreamer, getAvailableChatStreamers, getAvailableSwapStreams } =
    useStreamStore();

  const title = useMemo(() => (isChat ? `Chat: ${streamName}` : `Stream: ${streamName}`), [isChat, streamName]);

  const iframeSrc = useMemo(() => {
    if (isChat) {
      const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
      return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
    }
    return `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;
  }, [streamName, isChat, isDarkThemePreferred]);

  const handleChatChange = (newChatStreamer: string) => {
    changeChatStreamer(newChatStreamer);
  };

  const handleStreamSwap = (targetStreamName: string) => {
    swapStreamsByName(streamName, targetStreamName);
  };

  const availableChatStreamers = useMemo(
    () => getAvailableChatStreamers(streamName),
    [getAvailableChatStreamers, streamName]
  );

  const availableSwapStreams = useMemo(
    () => getAvailableSwapStreams(streamName),
    [getAvailableSwapStreams, streamName]
  );

  return (
    <section
      className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
      aria-label={title}
    >
      <div className="absolute z-10 w-full origin-top scale-y-0 transform-gpu transition-transform duration-300 ease-in-out group-hover:scale-y-100">
        <div className="flex flex-row items-center gap-6 bg-zinc-900 px-4 py-2 text-center backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <div className="mt-1 flex justify-center gap-2">
            {isChat && (
              <div className="group/chat relative">
                <button
                  onMouseDown={e => e.stopPropagation()}
                  className="rounded bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  type="button"
                >
                  Switch Chat ▼
                </button>
                <div className="invisible absolute top-full left-0 z-20 mt-1 w-32 rounded border border-gray-600 bg-zinc-800 opacity-0 shadow-lg transition-all duration-200 group-focus-within/chat:visible group-focus-within/chat:opacity-100 group-hover/chat:visible group-hover/chat:opacity-100">
                  {availableChatStreamers.map((streamer: string) => (
                    <button
                      key={streamer}
                      onClick={() => handleChatChange(streamer)}
                      onMouseDown={e => e.stopPropagation()}
                      className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none"
                      type="button"
                    >
                      {streamer}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isChat && (
              <div className="group/swap relative">
                <button
                  onMouseDown={e => e.stopPropagation()}
                  className="rounded bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700"
                  type="button"
                >
                  Swap ▼
                </button>
                <div className="invisible absolute top-full left-0 z-20 mt-1 w-32 rounded border border-gray-600 bg-zinc-800 opacity-0 shadow-lg transition-all duration-200 group-hover/swap:visible group-hover/swap:opacity-100">
                  {availableSwapStreams.map((targetStream: string) => (
                    <button
                      key={targetStream}
                      onClick={() => handleStreamSwap(targetStream)}
                      onMouseDown={e => e.stopPropagation()}
                      className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-zinc-700"
                      type="button"
                    >
                      Swap with {targetStream}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <iframe
        title={title}
        src={iframeSrc}
        height="100%"
        width="100%"
        allowFullScreen={!isChat}
        loading="lazy"
        className="transition-all duration-300 ease-in-out group-hover:mt-12"
        style={{ transform: 'translateZ(0)' }}
      />
    </section>
  );
});

StreamGridItem.displayName = 'StreamGridItem';

export default StreamGridItem;
