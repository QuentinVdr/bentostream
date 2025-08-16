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
  saveLayoutToStorage: () => void;
  resetLayoutForStreamCount: (streamCount: number) => void;
  clearAllLayouts: () => void;

  isActiveChat: (stream: string) => boolean;
}

const LAYOUT_STORAGE_KEY_PREFIX = 'bentostream-layout';

interface SavedLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'stream' | 'chat-active' | 'chat-hidden';
  position: number;
}

const getLayoutStorageKey = (streamCount: number): string => {
  return `${LAYOUT_STORAGE_KEY_PREFIX}-${streamCount}`;
};

const getAllLayoutStorageKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(LAYOUT_STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

const clearAllStoredLayouts = (): void => {
  try {
    const layoutKeys = getAllLayoutStorageKeys();
    layoutKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear all layouts:', error);
  }
};

const saveLayoutToLocalStorage = (streamCount: number, layout: Layout[]): void => {
  try {
    const storageKey = getLayoutStorageKey(streamCount);

    const normalizedLayout: SavedLayoutItem[] = [];
    const streamItems: Layout[] = [];
    let activeChatItem: Layout | null = null;
    const hiddenChatItems: Layout[] = [];

    layout.forEach(item => {
      const [type] = item.i.split('-', 2);
      if (type === 'stream') {
        streamItems.push(item);
      } else if (type === 'chat') {
        if (item.w > 0 && item.h > 0) {
          activeChatItem = item;
        } else {
          hiddenChatItems.push(item);
        }
      }
    });

    streamItems.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    streamItems.forEach((item, index) => {
      normalizedLayout.push({
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        type: 'stream',
        position: index,
      });
    });

    if (activeChatItem !== null) {
      const chatItem = activeChatItem as Layout;
      normalizedLayout.push({
        x: chatItem.x,
        y: chatItem.y,
        w: chatItem.w,
        h: chatItem.h,
        type: 'chat-active',
        position: -1,
      });
    }

    hiddenChatItems.forEach(() => {
      normalizedLayout.push({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        type: 'chat-hidden',
        position: -2,
      });
    });

    localStorage.setItem(storageKey, JSON.stringify(normalizedLayout));
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
};

const getLayoutFromLocalStorage = (streamCount: number): SavedLayoutItem[] | null => {
  try {
    const storageKey = getLayoutStorageKey(streamCount);
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return null;
  }
};

const loadLayoutFromLocalStorage = (
  streamCount: number,
  streams: string[],
  activeChatStreamer: string
): Layout[] | null => {
  try {
    const savedLayout = getLayoutFromLocalStorage(streamCount);

    if (!savedLayout) {
      return null;
    }

    const layout: Layout[] = [];
    const validActiveChatStreamer = streams.includes(activeChatStreamer) ? activeChatStreamer : streams[0];

    const streamLayouts = savedLayout
      .filter((item: SavedLayoutItem) => item.type === 'stream')
      .sort((a: SavedLayoutItem, b: SavedLayoutItem) => a.position - b.position);
    const activeChatLayout = savedLayout.find((item: SavedLayoutItem) => item.type === 'chat-active');

    if (streamLayouts.length !== streams.length) {
      console.warn('Saved layout stream count mismatch, regenerating...');
      return null;
    }

    streams.forEach((streamName, index) => {
      if (index < streamLayouts.length) {
        const savedItem = streamLayouts[index];
        layout.push({
          i: `stream-${streamName}`,
          x: savedItem.x,
          y: savedItem.y,
          w: savedItem.w,
          h: savedItem.h,
        });
      }
    });

    if (activeChatLayout) {
      layout.push({
        i: `chat-${validActiveChatStreamer}`,
        x: activeChatLayout.x,
        y: activeChatLayout.y,
        w: activeChatLayout.w,
        h: activeChatLayout.h,
      });
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
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return null;
  }
};

const generateLayout = (streams: string[], activeChatStreamer: string): Layout[] => {
  const streamCount = streams.length;

  if (streamCount === 0) {
    return [];
  }

  const savedLayout = loadLayoutFromLocalStorage(streamCount, streams, activeChatStreamer);
  if (savedLayout) {
    return savedLayout;
  }

  const layout: Layout[] = [];
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
          const streamItems: Layout[] = [];
          let activeChatItem: Layout | null = null;

          state.layout.forEach(item => {
            const [type] = item.i.split('-', 2);
            if (type === 'stream') {
              streamItems.push(item);
            } else if (type === 'chat' && item.w > 0 && item.h > 0) {
              activeChatItem = item;
            }
          });

          streamItems.sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
          });

          const newLayout: Layout[] = [];

          streams.forEach((streamName, index) => {
            if (index < streamItems.length) {
              const originalItem = streamItems[index];
              newLayout.push({
                ...originalItem,
                i: `stream-${streamName}`,
              });
            }
          });

          if (activeChatItem !== null) {
            const chatItem = activeChatItem as Layout;
            newLayout.push({
              i: `chat-${newActiveChatStreamer}`,
              x: chatItem.x,
              y: chatItem.y,
              w: chatItem.w,
              h: chatItem.h,
            });
          }

          for (const stream of streams) {
            if (stream !== newActiveChatStreamer) {
              newLayout.push({
                i: `chat-${stream}`,
                x: 0,
                y: 0,
                w: 0,
                h: 0,
              });
            }
          }

          layout = newLayout;
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
        const state = get();
        set({
          layout: newLayout,
        });

        if (state.streams.length > 0) {
          saveLayoutToLocalStorage(state.streams.length, newLayout);
        }
      },

      saveLayoutToStorage: () => {
        const state = get();
        if (state.streams.length > 0 && state.layout.length > 0) {
          saveLayoutToLocalStorage(state.streams.length, state.layout);
        }
      },

      resetLayoutForStreamCount: (streamCount: number) => {
        const state = get();
        try {
          const storageKey = getLayoutStorageKey(streamCount);
          localStorage.removeItem(storageKey);

          if (state.streams.length === streamCount) {
            const newLayout = generateLayout(state.streams, state.activeChatStreamer);
            set({ layout: newLayout });
          }
        } catch (error) {
          console.warn('Failed to reset layout:', error);
        }
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

      clearAllLayouts: () => {
        clearAllStoredLayouts();
      },
    }),
    {
      name: 'stream-store',
    }
  )
);
