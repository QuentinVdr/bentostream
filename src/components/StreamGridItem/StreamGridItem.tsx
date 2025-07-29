import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useStreamStore } from '../../stores/streamStore';

interface StreamGridItemProps {
  streamName: string;
  isChat?: boolean;
  isDarkThemePreferred?: boolean;
  streamIndex?: number;
}

const StreamGridItem = memo(
  ({ streamName, isChat = false, isDarkThemePreferred = false, streamIndex }: StreamGridItemProps) => {
    const [isTitleHovered, setIsTitleHovered] = useState(false);
    const [showChatDropdown, setShowChatDropdown] = useState(false);
    const [showSwapDropdown, setShowSwapDropdown] = useState(false);
    const chatDropdownRef = useRef<HTMLDivElement>(null);
    const swapDropdownRef = useRef<HTMLDivElement>(null);

    const { swapStreamsByName, changeChatStreamer, getAvailableChatStreamers, getAvailableSwapStreams } =
      useStreamStore();

    const title = useMemo(() => (isChat ? `Chat: ${streamName}` : `Stream: ${streamName}`), [isChat, streamName]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (chatDropdownRef.current && !chatDropdownRef.current.contains(event.target as Node)) {
          setShowChatDropdown(false);
        }
        if (swapDropdownRef.current && !swapDropdownRef.current.contains(event.target as Node)) {
          setShowSwapDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const iframeSrc = useMemo(() => {
      if (isChat) {
        const darkParam = isDarkThemePreferred ? '&darkpopout' : '';
        return `https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${darkParam}`;
      }
      return `https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`;
    }, [streamName, isChat, isDarkThemePreferred]);

    const handleChatChange = (newChatStreamer?: string) => {
      if (isChat) {
        if (newChatStreamer) {
          changeChatStreamer(newChatStreamer);
          setShowChatDropdown(false);
        } else {
          setShowChatDropdown(!showChatDropdown);
        }
      }
    };

    const handleStreamSwap = (targetStreamName?: string) => {
      if (!isChat && typeof streamIndex === 'number') {
        if (targetStreamName) {
          swapStreamsByName(streamName, targetStreamName);
          setShowSwapDropdown(false);
        } else {
          setShowSwapDropdown(!showSwapDropdown);
        }
      }
    };

    const availableChatStreamers = useMemo(() => {
      return getAvailableChatStreamers(streamName);
    }, [getAvailableChatStreamers, streamName]);

    const availableSwapStreams = useMemo(() => {
      return getAvailableSwapStreams(streamName);
    }, [getAvailableSwapStreams, streamName]);

    return (
      <section
        className="group flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900"
        onMouseLeave={() => setIsTitleHovered(false)}
        onMouseEnter={() => setIsTitleHovered(true)}
        aria-label={title}
      >
        <div className="absolute z-10 w-full origin-top scale-y-0 transform-gpu transition-transform duration-300 ease-in-out group-hover:scale-y-100">
          <div className="flex flex-row items-center gap-6 bg-zinc-900 px-4 py-2 text-center backdrop-blur-sm">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <div className="mt-1 flex justify-center gap-2">
              {isChat && (
                <div className="relative" ref={chatDropdownRef}>
                  <button
                    onClick={() => handleChatChange()}
                    onMouseDown={e => e.stopPropagation()}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    type="button"
                  >
                    Switch Chat ▼
                  </button>
                  {showChatDropdown && (
                    <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded border border-gray-600 bg-zinc-800 shadow-lg">
                      {availableChatStreamers.map((streamer: string) => (
                        <button
                          key={streamer}
                          onClick={() => handleChatChange(streamer)}
                          onMouseDown={e => e.stopPropagation()}
                          className="block w-full px-3 py-2 text-left text-xs text-white hover:bg-zinc-700"
                          type="button"
                        >
                          {streamer}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!isChat && typeof streamIndex === 'number' && (
                <div className="relative" ref={swapDropdownRef}>
                  <button
                    onClick={() => handleStreamSwap()}
                    onMouseDown={e => e.stopPropagation()}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    type="button"
                  >
                    Swap ▼
                  </button>
                  {showSwapDropdown && (
                    <div className="absolute top-full left-0 z-20 mt-1 w-32 rounded border border-gray-600 bg-zinc-800 shadow-lg">
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
                  )}
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
          className={
            isTitleHovered
              ? 'transition-margin mt-12 duration-300 ease-in-out'
              : 'transition-margin duration-300 ease-in-out'
          }
          style={{ transform: 'translateZ(0)' }}
        />
      </section>
    );
  }
);

StreamGridItem.displayName = 'StreamGridItem';

export default StreamGridItem;
