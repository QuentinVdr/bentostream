import type { Layout } from 'react-grid-layout';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface StreamStore {
  // State
  streams: string[];
  activeChatStreamer: string;
  layout: Layout[];

  // Actions
  setStreams: (streams: string[]) => void;
  swapStreamsByName: (nameA: string, nameB: string) => void;
  changeChatStreamer: (streamer: string) => void;

  // Getters
  getAvailableChatStreamers: (excludeStreamer?: string) => string[];
  getAvailableSwapStreams: (excludeStreamer: string) => string[];
}

// Layout generation function (moved from useGridLayout)
const generateLayout = (streams: string[]): Layout[] => {
  const layout: Layout[] = [];
  const streamCount = streams.length;

  if (streamCount === 1) {
    layout.push(
      {
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 9,
        h: 8,
      },
      {
        i: `chat-${streams[0]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 8,
      }
    );
  } else if (streamCount === 2) {
    layout.push(
      {
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 9,
        h: 12,
      },
      {
        i: `stream-${streams[1]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 4,
      },
      {
        i: `chat-${streams[0]}`,
        x: 9,
        y: 4,
        w: 3,
        h: 8,
      }
    );
  } else if (streamCount === 3) {
    layout.push(
      {
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 8,
        h: 8,
      },
      {
        i: `stream-${streams[1]}`,
        x: 0,
        y: 8,
        w: 4,
        h: 4,
      },
      {
        i: `stream-${streams[2]}`,
        x: 4,
        y: 8,
        w: 4,
        h: 4,
      },
      {
        i: `chat-${streams[0]}`,
        x: 8,
        y: 0,
        w: 4,
        h: 12,
      }
    );
  } else if (streamCount === 4) {
    layout.push(
      {
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 9,
        h: 8,
      },
      {
        i: `stream-${streams[1]}`,
        x: 0,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[2]}`,
        x: 3,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[3]}`,
        x: 6,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `chat-${streams[0]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 12,
      }
    );
  } else if (streamCount === 5) {
    layout.push(
      {
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 9,
        h: 8,
      },
      {
        i: `stream-${streams[1]}`,
        x: 0,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[2]}`,
        x: 3,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[3]}`,
        x: 6,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[4]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 4,
      },
      {
        i: `chat-${streams[0]}`,
        x: 9,
        y: 4,
        w: 3,
        h: 8,
      }
    );
  } else if (streamCount === 6) {
    layout.push(
      {
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 6,
        h: 8,
      },
      {
        i: `stream-${streams[1]}`,
        x: 0,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[2]}`,
        x: 3,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[3]}`,
        x: 6,
        y: 8,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[4]}`,
        x: 6,
        y: 0,
        w: 3,
        h: 4,
      },
      {
        i: `stream-${streams[5]}`,
        x: 6,
        y: 4,
        w: 3,
        h: 4,
      },
      {
        i: `chat-${streams[0]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 12,
      }
    );
  } else {
    const cols = Math.ceil(Math.sqrt(streamCount));
    const streamWidth = Math.floor(12 / cols);

    streams.forEach((streamName, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      layout.push({
        i: `stream-${streamName}`,
        x: col * streamWidth,
        y: row,
        w: streamWidth,
        h: 5,
      });
    });

    const chatRow = Math.ceil(streamCount / cols);
    layout.push({
      i: `chat-${streams[0]}`,
      x: 8,
      y: chatRow,
      w: 4,
      h: 4,
    });
  }

  if (streamCount > 1) {
    for (let i = 1; i < streamCount; i++) {
      layout.push({
        i: `chat-${streams[i]}`,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      });
    }
  }

  return layout;
};

export const useStreamStore = create<StreamStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      streams: [],
      activeChatStreamer: '',
      layout: [],

      // Actions
      setStreams: (streams: string[]) => {
        const newLayout = generateLayout(streams);
        set({
          streams: streams,
          activeChatStreamer: streams[0] || '',
          layout: newLayout,
        });
      },

      swapStreamsByName: (nameA: string, nameB: string) => {
        const state = get();

        // Find the layouts for both streams and chats
        const streamLayoutA = state.layout.find(l => l.i === `stream-${nameA}`);
        const streamLayoutB = state.layout.find(l => l.i === `stream-${nameB}`);
        const chatLayoutA = state.layout.find(l => l.i === `chat-${nameA}`);
        const chatLayoutB = state.layout.find(l => l.i === `chat-${nameB}`);

        if (!streamLayoutA || !streamLayoutB || !chatLayoutA || !chatLayoutB) {
          return; // Can't swap if layouts don't exist
        }

        // Swap the layout positions
        const newLayout = state.layout.map(item => {
          // Swap stream positions
          if (item.i === `stream-${nameA}`) {
            return { ...item, x: streamLayoutB.x, y: streamLayoutB.y, w: streamLayoutB.w, h: streamLayoutB.h };
          } else if (item.i === `stream-${nameB}`) {
            return { ...item, x: streamLayoutA.x, y: streamLayoutA.y, w: streamLayoutA.w, h: streamLayoutA.h };
          }
          // Swap chat positions
          else if (item.i === `chat-${nameA}`) {
            return { ...item, x: chatLayoutB.x, y: chatLayoutB.y, w: chatLayoutB.w, h: chatLayoutB.h };
          } else if (item.i === `chat-${nameB}`) {
            return { ...item, x: chatLayoutA.x, y: chatLayoutA.y, w: chatLayoutA.w, h: chatLayoutA.h };
          }
          return item;
        });

        // Update the active chat streamer if one of the swapped streams was the active chat
        let newActiveChatStreamer = state.activeChatStreamer;
        if (state.activeChatStreamer === nameA) {
          newActiveChatStreamer = nameB;
        } else if (state.activeChatStreamer === nameB) {
          newActiveChatStreamer = nameA;
        }

        set({
          layout: newLayout,
          activeChatStreamer: newActiveChatStreamer,
        });
      },

      changeChatStreamer: (streamer: string) => {
        const state = get();
        if (state.streams.includes(streamer) && streamer !== state.activeChatStreamer) {
          // Find the currently visible chat layout
          const currentChatLayout = state.layout.find(l => l.i === `chat-${state.activeChatStreamer}`);
          // Find the target chat layout (should be hidden with 0x0)
          const targetChatLayout = state.layout.find(l => l.i === `chat-${streamer}`);

          if (currentChatLayout && targetChatLayout) {
            // Swap the chat layouts: hide current, show target
            const newLayout = state.layout.map(item => {
              if (item.i === `chat-${state.activeChatStreamer}`) {
                // Hide the current chat
                return { ...item, x: 0, y: 0, w: 0, h: 0 };
              } else if (item.i === `chat-${streamer}`) {
                // Show the target chat in the current chat's position
                return {
                  ...item,
                  x: currentChatLayout.x,
                  y: currentChatLayout.y,
                  w: currentChatLayout.w,
                  h: currentChatLayout.h,
                };
              }
              return item;
            });

            set({
              activeChatStreamer: streamer,
              layout: newLayout,
            });
          } else {
            // Fallback: just change the active chat streamer
            set({ activeChatStreamer: streamer });
          }
        }
      },

      // Getters
      getAvailableChatStreamers: (excludeStreamer?: string) => {
        const streams = get().streams;
        return excludeStreamer ? streams.filter((s: string) => s !== excludeStreamer) : streams;
      },

      getAvailableSwapStreams: (excludeStreamer: string) => {
        return get().streams.filter((s: string) => s !== excludeStreamer);
      },
    }),
    {
      name: 'stream-store', // DevTools name
    }
  )
);
