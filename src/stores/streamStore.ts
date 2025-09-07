import type { Layout } from 'react-grid-layout';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SavedLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'stream' | 'chat';
  streamName?: string; // For identifying which stream/chat this belongs to
  isActive?: boolean; // For chat items, indicates if it's the active chat
}

interface SavedLayout {
  items: SavedLayoutItem[];
  activeChat: string | null; // Explicitly save which chat is active
  version: number; // For future migration if needed
}

const LAYOUT_STORAGE_KEY_PREFIX = 'bentostream-layout';
const LAYOUT_VERSION = 2; // Bump this when changing the format

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

const saveLayoutToLocalStorage = (streamCount: number, layout: Layout[], activeChat: string): void => {
  try {
    const storageKey = getLayoutStorageKey(streamCount);

    const savedLayout: SavedLayout = {
      items: [],
      activeChat: activeChat || null,
      version: LAYOUT_VERSION,
    };

    // Process each layout item
    layout.forEach(item => {
      const [type, ...nameParts] = item.i.split('-');
      const name = nameParts.join('-'); // Handle stream names with dashes

      if (type === 'stream') {
        savedLayout.items.push({
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          type: 'stream',
          streamName: name,
        });
      } else if (type === 'chat') {
        // Save chat position regardless of whether it's visible or hidden
        const isActive = name === activeChat && item.w > 0 && item.h > 0;
        savedLayout.items.push({
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          type: 'chat',
          streamName: name,
          isActive,
        });
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(savedLayout));
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
};

const loadLayoutFromLocalStorage = (
  streamCount: number,
  streams: string[],
  requestedActiveChat: string
): { layout: Layout[] | null; activeChat: string } => {
  try {
    const storageKey = getLayoutStorageKey(streamCount);
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return { layout: null, activeChat: requestedActiveChat };
    }

    const savedLayout: SavedLayout = JSON.parse(saved);

    // Handle old format (backward compatibility)
    if (!savedLayout.version || savedLayout.version < LAYOUT_VERSION) {
      // Clear old format and return null to regenerate
      localStorage.removeItem(storageKey);
      return { layout: null, activeChat: requestedActiveChat };
    }

    // Validate that all current streams have corresponding saved items
    const savedStreamNames = savedLayout.items.filter(item => item.type === 'stream').map(item => item.streamName);

    // Check if streams match (order doesn't matter for validation)
    const streamsMatch =
      streams.length === savedStreamNames.length && streams.every(stream => savedStreamNames.includes(stream));

    if (!streamsMatch) {
      console.warn('Saved layout streams mismatch, regenerating...');
      return { layout: null, activeChat: requestedActiveChat };
    }

    const layout: Layout[] = [];

    // Determine active chat
    let activeChat = savedLayout.activeChat || '';

    // Validate that saved active chat is still in the streams list
    if (activeChat && !streams.includes(activeChat)) {
      activeChat = requestedActiveChat || streams[0] || '';
    }

    // If no active chat was saved but one is requested, use the requested one
    if (!activeChat && requestedActiveChat && streams.includes(requestedActiveChat)) {
      activeChat = requestedActiveChat;
    }

    // Create a map for quick lookup of saved positions
    const streamPositions = new Map<string, SavedLayoutItem>();
    const chatPositions = new Map<string, SavedLayoutItem>();

    savedLayout.items.forEach(item => {
      if (item.type === 'stream' && item.streamName) {
        streamPositions.set(item.streamName, item);
      } else if (item.type === 'chat' && item.streamName) {
        chatPositions.set(item.streamName, item);
      }
    });

    // Add stream layouts
    streams.forEach(streamName => {
      const savedItem = streamPositions.get(streamName);
      if (savedItem) {
        layout.push({
          i: `stream-${streamName}`,
          x: savedItem.x,
          y: savedItem.y,
          w: savedItem.w,
          h: savedItem.h,
        });
      }
    });

    // Add chat layouts
    streams.forEach(streamName => {
      const savedItem = chatPositions.get(streamName);

      if (savedItem) {
        // Use saved position
        layout.push({
          i: `chat-${streamName}`,
          x: savedItem.x,
          y: savedItem.y,
          w: savedItem.w,
          h: savedItem.h,
        });
      } else if (streamName === activeChat) {
        // No saved position but this should be active - give it a default visible position
        layout.push({
          i: `chat-${streamName}`,
          x: 9,
          y: 0,
          w: 3,
          h: 8,
        });
      } else {
        // Hidden chat
        layout.push({
          i: `chat-${streamName}`,
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        });
      }
    });

    return { layout, activeChat };
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return { layout: null, activeChat: requestedActiveChat };
  }
};

const generateDefaultLayout = (streams: string[], activeChat?: string): { layout: Layout[]; activeChat: string } => {
  const streamCount = streams.length;

  if (streamCount === 0) {
    return { layout: [], activeChat: '' };
  }

  const layout: Layout[] = [];
  activeChat = activeChat || streams[0];

  // Generate default layouts based on stream count
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
        i: `chat-${activeChat}`,
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
        i: `chat-${activeChat}`,
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
        i: `chat-${activeChat}`,
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
        i: `chat-${activeChat}`,
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
        i: `chat-${activeChat}`,
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
        i: `chat-${activeChat}`,
        x: 9,
        y: 0,
        w: 3,
        h: 12,
      }
    );
  }

  for (let i = 1; i < streams.length; i++) {
    const stream = streams[i];
    if (stream !== activeChat) {
      layout.push({
        i: `chat-${stream}`,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      });
    }
  }

  return { layout, activeChat };
};

const generateOrLoadLayout = (streams: string[], activeChat: string): { layout: Layout[]; activeChat: string } => {
  const streamCount = streams.length;

  if (streamCount === 0) {
    return { layout: [], activeChat: '' };
  }

  // First, try to load from localStorage
  const { layout: savedLayout, activeChat: loadedActiveChat } = loadLayoutFromLocalStorage(
    streamCount,
    streams,
    activeChat
  );

  if (savedLayout) {
    // Successfully loaded from storage
    return { layout: savedLayout, activeChat: loadedActiveChat };
  }

  // No saved layout, generate default
  return generateDefaultLayout(streams, activeChat);
};

interface StreamStore {
  streams: string[];
  activeChat: string;
  layout: Layout[];

  // stream on change callback
  onStreamsChange?: (streams: string[]) => void;
  setOnStreamsChange: (callback: (streams: string[]) => void) => void;

  // stream
  setStreams: (streams: string[], shouldTriggerCallback?: boolean) => void;

  // swap
  swapItemByName: (nameA: string, nameB: string) => void;
  swapStreamsByName: (nameA: string, nameB: string) => void;

  // chat
  addChat: (streamer: string) => void;
  removeChat: (streamer: string) => void;
  changeChat: (streamer: string) => void;
  isActiveChat: (stream: string) => boolean;
  noActiveChat: () => boolean;
  hasActiveChat: () => boolean;

  // layout
  updateLayout: (layout: Layout[]) => void;
  saveLayoutToStorage: () => void;
  resetLayoutForStreamCount: (streamCount: number) => void;
  clearAllLayouts: () => void;
}

export const useStreamStore = create<StreamStore>()(
  devtools(
    (set, get) => ({
      streams: [],
      activeChat: '',
      layout: [],
      onStreamsChange: undefined,

      setOnStreamsChange: (callback: (streams: string[]) => void) => {
        set({ onStreamsChange: callback });
      },

      setStreams: (streams: string[], shouldTriggerCallback = false) => {
        const state = get();

        if (JSON.stringify(state.streams) === JSON.stringify(streams)) {
          return;
        }

        let newActiveChat = state.activeChat;
        if (state.activeChat && !streams.includes(state.activeChat)) {
          // Previous active chat is no longer in streams, clear it
          newActiveChat = '';
        }

        let layout;
        let finalActiveChat;

        if (state.streams.length !== streams.length) {
          // Stream count changed, try to load saved layout or generate new one
          const result = generateOrLoadLayout(streams, newActiveChat);
          layout = result.layout;
          finalActiveChat = result.activeChat;
        } else {
          // Same number of streams, preserve current layout structure but update stream names
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

          // Add stream items
          streams.forEach((streamName, index) => {
            if (index < streamItems.length) {
              const originalItem = streamItems[index];
              newLayout.push({
                ...originalItem,
                i: `stream-${streamName}`,
              });
            }
          });

          // Add chat items
          if (activeChatItem && newActiveChat) {
            const chatItem = activeChatItem as Layout;
            newLayout.push({
              i: `chat-${newActiveChat}`,
              x: chatItem.x,
              y: chatItem.y,
              w: chatItem.w,
              h: chatItem.h,
            });
          }

          // Add hidden chats for other streams
          for (const stream of streams) {
            if (stream !== newActiveChat) {
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
          finalActiveChat = newActiveChat;
        }

        set({
          streams: streams,
          activeChat: finalActiveChat,
          layout: layout,
        });

        if (shouldTriggerCallback && state.onStreamsChange) {
          state.onStreamsChange(streams);
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

      addChat: (streamer: string) => {
        const state = get();
        if (state.streams.includes(streamer)) {
          const layoutName = `chat-${streamer}`;

          const newLayout = state.layout.map((item: Layout) => {
            if (item.i === layoutName) {
              // Make this chat visible with default position
              return { ...item, x: 9, y: 0, w: 3, h: 8 };
            } else if (item.i.startsWith('chat-') && item.w > 0 && item.h > 0) {
              // Hide any other active chat
              return { ...item, x: 0, y: 0, w: 0, h: 0 };
            }
            return item;
          });

          set({
            activeChat: streamer,
            layout: newLayout,
          });

          // Save the new layout state
          saveLayoutToLocalStorage(state.streams.length, newLayout, streamer);
        }
      },

      removeChat: (streamer: string) => {
        const state = get();
        const layoutName = `chat-${streamer}`;

        const newLayout = state.layout.map((item: Layout) => {
          if (item.i === layoutName) {
            return { ...item, x: 0, y: 0, w: 0, h: 0 };
          }
          return item;
        });

        set({
          activeChat: '',
          layout: newLayout,
        });

        // Save the new layout state
        saveLayoutToLocalStorage(state.streams.length, newLayout, '');
      },

      changeChat: (streamer: string) => {
        const state = get();
        if (state.streams.includes(streamer) && streamer !== state.activeChat) {
          state.swapItemByName(`chat-${state.activeChat}`, `chat-${streamer}`);
          set({
            activeChat: streamer,
          });

          // Save the new layout state
          saveLayoutToLocalStorage(state.streams.length, state.layout, streamer);
        }
      },

      isActiveChat: (stream: string) => {
        return get().activeChat === stream;
      },

      noActiveChat: () => {
        return get().activeChat === '';
      },

      hasActiveChat: () => {
        return get().activeChat !== '';
      },

      updateLayout: (newLayout: Layout[]) => {
        const state = get();
        set({
          layout: newLayout,
        });

        if (state.streams.length > 0) {
          saveLayoutToLocalStorage(state.streams.length, newLayout, state.activeChat);
        }
      },

      saveLayoutToStorage: () => {
        const state = get();
        if (state.streams.length > 0 && state.layout.length > 0) {
          saveLayoutToLocalStorage(state.streams.length, state.layout, state.activeChat);
        }
      },

      resetLayoutForStreamCount: (streamCount: number) => {
        const state = get();
        try {
          const storageKey = getLayoutStorageKey(streamCount);
          localStorage.removeItem(storageKey);

          if (state.streams.length === streamCount) {
            // Generate new default layout instead of trying to load
            set(generateDefaultLayout(state.streams, state.activeChat));
          }
        } catch (error) {
          console.warn('Failed to reset layout:', error);
        }
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
