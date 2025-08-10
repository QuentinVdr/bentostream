import type { Layout } from 'react-grid-layout';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface StreamStore {
  streams: string[];
  activeChatStreamer: string;
  layout: Layout[];
  onStreamsChange?: (streams: string[]) => void;

  setStreams: (streams: string[]) => void;
  addStream: (streamName: string) => void;
  removeStream: (streamName: string) => void;
  updateLayout: (layout: Layout[]) => void;
  swapStreamsByName: (nameA: string, nameB: string) => void;
  swapItemByName: (nameA: string, nameB: string) => void;
  changeChatStreamer: (streamer: string) => void;
  setOnStreamsChange: (callback: (streams: string[]) => void) => void;

  isActiveChat: (stream: string) => boolean;
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
      onStreamsChange: undefined,

      setStreams: (streams: string[]) => {
        const state = get();

        // Skip update if streams are the same (ignore order)
        if (state.streams.length > 0) {
          if (
            JSON.stringify([...state.streams].sort((a, b) => a.localeCompare(b))) ===
            JSON.stringify([...streams].sort((a, b) => a.localeCompare(b)))
          ) {
            return;
          }
        }

        let newActiveChatStreamer = state.activeChatStreamer;
        if (!state.activeChatStreamer || !streams.includes(state.activeChatStreamer)) {
          newActiveChatStreamer = streams.length > 0 ? streams[0] : '';
        }

        const layout = generateLayout(streams);
        set({
          streams: streams,
          activeChatStreamer: newActiveChatStreamer,
          layout: layout,
        });
      },

      updateLayout: (newLayout: Layout[]) => {
        set({
          layout: newLayout,
        });
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

        set({
          layout: newLayout,
        });
      },

      swapStreamsByName: (nameA: string, nameB: string) => {
        const state = get();

        // Just swap the layout items, don't change streams array
        get().swapItemByName(`stream-${nameA}`, `stream-${nameB}`);

        // Update URL with the new logical order based on layout positions
        if (state.onStreamsChange) {
          // Get the current layout and determine new stream order based on positions
          const currentLayout = get().layout;
          const streamLayouts = currentLayout
            .filter(item => item.i.startsWith('stream-'))
            .sort((a, b) => {
              // Sort by position (top-left to bottom-right)
              if (a.y !== b.y) return a.y - b.y;
              return a.x - b.x;
            })
            .map(item => item.i.replace('stream-', ''));

          state.onStreamsChange(streamLayouts);
        }
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

      isActiveChat: (stream: string) => {
        return get().activeChatStreamer === stream;
      },

      addStream: (streamName: string) => {
        const state = get();
        if (!state.streams.includes(streamName)) {
          const newStreams = [...state.streams, streamName];
          const newLayout = generateLayout(newStreams);

          const newActiveChatStreamer = state.activeChatStreamer || streamName;

          set({
            streams: newStreams,
            activeChatStreamer: newActiveChatStreamer,
            layout: newLayout,
          });
        }
      },

      removeStream: (streamName: string) => {
        const state = get();
        const streamIndex = state.streams.indexOf(streamName);
        if (streamIndex === -1) return;

        const newStreams = state.streams.filter(s => s !== streamName);

        let newActiveChatStreamer = state.activeChatStreamer;
        if (state.activeChatStreamer === streamName && newStreams.length > 0) {
          newActiveChatStreamer = newStreams[0];
        }

        const newLayout = generateLayout(newStreams);

        set({
          streams: newStreams,
          activeChatStreamer: newActiveChatStreamer,
          layout: newLayout,
        });
      },

      setOnStreamsChange: (callback: (streams: string[]) => void) => {
        set({ onStreamsChange: callback });
      },
    }),
    {
      name: 'stream-store',
    }
  )
);
