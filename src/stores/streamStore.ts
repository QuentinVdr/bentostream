import type { Layout } from 'react-grid-layout';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface StreamStore {
  streams: string[];
  activeChatStreamer: string;
  layout: Layout[];
  onStreamsChange?: (streams: string[]) => void;

  setStreams: (streams: string[], shouldTriggerCallback?: boolean) => void;
  updateLayout: (layout: Layout[]) => void;
  swapStreamsByName: (nameA: string, nameB: string) => void;
  swapItemByName: (nameA: string, nameB: string) => void;
  changeChatStreamer: (streamer: string) => void;
  setOnStreamsChange: (callback: (streams: string[]) => void) => void;

  isActiveChat: (stream: string) => boolean;
}

const generateLayout = (streams: string[], activeChatStreamer: string): Layout[] => {
  const layout: Layout[] = [];
  const streamCount = streams.length;

  if (streamCount === 0) {
    return layout;
  }

  const validActiveChatStreamer = streams.includes(activeChatStreamer) ? activeChatStreamer : streams[0];

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
        i: `chat-${validActiveChatStreamer}`,
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
        i: `chat-${validActiveChatStreamer}`,
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
        i: `chat-${validActiveChatStreamer}`,
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
        i: `chat-${validActiveChatStreamer}`,
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
        i: `chat-${validActiveChatStreamer}`,
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
        i: `chat-${validActiveChatStreamer}`,
        x: 9,
        y: 0,
        w: 3,
        h: 12,
      }
    );
  }

  for (const stream of streams) {
    if (stream !== validActiveChatStreamer) {
      layout.push({
        i: `chat-${stream}`,
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
      streams: [],
      activeChatStreamer: '',
      layout: [],
      onStreamsChange: undefined,

      setStreams: (streams: string[], shouldTriggerCallback = false) => {
        const state = get();

        if (JSON.stringify(state.streams) === JSON.stringify(streams)) {
          return;
        }

        let newActiveChatStreamer = state.activeChatStreamer;
        if (!state.activeChatStreamer || !streams.includes(state.activeChatStreamer)) {
          newActiveChatStreamer = streams.length > 0 ? streams[0] : '';
        }

        let layout;
        if (state.streams.length !== streams.length) {
          layout = generateLayout(streams, newActiveChatStreamer);
        } else {
          const streamMapping = new Map<string, string>();
          for (let i = 0; i < state.streams.length; i++) {
            streamMapping.set(state.streams[i], streams[i]);
          }

          const streamWithOutChat = streams.filter(s => s !== newActiveChatStreamer);

          layout = state.layout.map((item: Layout) => {
            const regex = /^(stream-|chat-)(.+)$/;
            const match = regex.exec(item.i);
            if (match) {
              const [, prefix, streamName] = match;
              if (prefix === 'stream-') {
                const newStreamName = streamMapping.get(streamName);
                if (newStreamName && newStreamName !== streamName) {
                  return { ...item, i: `${prefix}${newStreamName}` };
                }
              } else if (prefix === 'chat-') {
                if (streamName === state.activeChatStreamer) {
                  return { ...item, i: `${prefix}${newActiveChatStreamer}` };
                } else {
                  return { ...item, i: `${prefix}${streamWithOutChat.shift()}` };
                }
              }
            }
            return item;
          });
        }

        set({
          streams: streams,
          activeChatStreamer: newActiveChatStreamer,
          layout: layout,
        });

        if (shouldTriggerCallback && state.onStreamsChange) {
          state.onStreamsChange(streams);
        }
      },

      updateLayout: (newLayout: Layout[]) => {
        set({
          layout: newLayout,
        });
      },

      swapItemByName: (nameA: string, nameB: string) => {
        const state = get();

        const layoutA = state.layout.find((l: { i: string }) => l.i === nameA);
        const layoutB = state.layout.find((l: { i: string }) => l.i === nameB);

        if (!layoutA || !layoutB) {
          return;
        }

        const newLayout = state.layout.map((item: Layout) => {
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

        const newStreams = [...state.streams];
        const indexA = newStreams.indexOf(nameA);
        const indexB = newStreams.indexOf(nameB);

        if (indexA !== -1 && indexB !== -1) {
          [newStreams[indexA], newStreams[indexB]] = [newStreams[indexB], newStreams[indexA]];
        }

        state.swapItemByName(`stream-${nameA}`, `stream-${nameB}`);

        set({
          streams: newStreams,
        });

        if (state.onStreamsChange) {
          state.onStreamsChange(newStreams);
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
          const newActiveChatStreamer = state.activeChatStreamer || streamName;
          const newLayout = generateLayout(newStreams, newActiveChatStreamer);

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

        const newStreams = state.streams.filter((s: string) => s !== streamName);

        let newActiveChatStreamer = state.activeChatStreamer;
        if (state.activeChatStreamer === streamName && newStreams.length > 0) {
          newActiveChatStreamer = newStreams[0];
        }

        const newLayout = generateLayout(newStreams, newActiveChatStreamer);

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
