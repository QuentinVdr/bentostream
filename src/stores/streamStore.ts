import type { Layout } from 'react-grid-layout';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface StreamStore {
  streams: string[];
  activeChatStreamer: string;
  layout: Layout[];

  setStreams: (streams: string[]) => void;
  updateLayout: (layout: Layout[]) => void;
  swapStreamsByName: (nameA: string, nameB: string) => void;
  swapItemByName: (nameA: string, nameB: string) => void;
  changeChatStreamer: (streamer: string) => void;

  getAvailableChatStreamers: (excludeStreamer?: string) => string[];
  getAvailableSwapStreams: (excludeStreamer: string) => string[];
}

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

  for (let i = 1; i < streamCount; i++) {
    layout.push({
      i: `chat-${streams[i]}`,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });
  }

  return layout;
};

export const useStreamStore = create<StreamStore>()(
  devtools(
    (set, get) => ({
      streams: [],
      activeChatStreamer: '',
      layout: [],

      setStreams: (streams: string[]) => {
        set({
          streams: streams,
          activeChatStreamer: streams[0] || '',
          layout: generateLayout(streams),
        });
      },

      updateLayout: (layout: Layout[]) => {
        const state = get();
        const hiddenChatsStream = state.streams.filter(stream => stream !== state.activeChatStreamer);
        const hiddenChatsLayout = hiddenChatsStream.map(stream => ({
          i: `chat-${stream}`,
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        }));
        const finalLayout = [...layout, ...hiddenChatsLayout];
        set({ layout: finalLayout });
      },

      swapItemByName: (nameA: string, nameB: string) => {
        const state = get();

        const layoutA = state.layout.find(l => l.i === nameA);
        const layoutB = state.layout.find(l => l.i === nameB);

        if (!layoutA || !layoutB) {
          return;
        }

        const newLayout = state.layout.map(item => {
          if (item.i === nameA) {
            return { ...item, x: layoutB.x, y: layoutB.y, w: layoutB.w, h: layoutB.h };
          } else if (item.i === nameB) {
            return { ...item, x: layoutA.x, y: layoutA.y, w: layoutA.w, h: layoutA.h };
          }
          return item;
        });

        state.updateLayout(newLayout);
      },

      swapStreamsByName: (nameA: string, nameB: string) => {
        get().swapItemByName(`stream-${nameA}`, `stream-${nameB}`);
      },

      changeChatStreamer: (streamer: string) => {
        const state = get();
        if (state.streams.includes(streamer) && streamer !== state.activeChatStreamer) {
          state.swapItemByName(`chat-${state.activeChatStreamer}`, `chat-${streamer}`);
          set({
            activeChatStreamer: streamer,
          });
        }
      },

      getAvailableChatStreamers: (excludeStreamer?: string) => {
        const streams = get().streams;
        return excludeStreamer ? streams.filter((s: string) => s !== excludeStreamer) : streams;
      },

      getAvailableSwapStreams: (excludeStreamer: string) => {
        return get().streams.filter((s: string) => s !== excludeStreamer);
      },
    }),
    {
      name: 'stream-store',
    }
  )
);
