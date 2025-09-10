import type { Layout } from 'react-grid-layout';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { swapArrayElements } from '../utils/ArrayUtils';
import {
  clearAllStoredLayouts,
  generateDefaultLayout,
  generateOrLoadLayout,
  getLayoutStorageKey,
  saveLayoutToLocalStorage,
} from '../utils/LayoutUtils';

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
  swapItemByName: (nameA: string, nameB: string) => Layout[] | undefined;
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

      swapItemByName: (nameA: string, nameB: string): Layout[] | undefined => {
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

        return newLayout;
      },

      swapStreamsByName: (nameA: string, nameB: string) => {
        const state = get();

        if (nameA === nameB) {
          return;
        }

        if (!state.streams.includes(nameA) || !state.streams.includes(nameB)) {
          return;
        }

        swapArrayElements(state.streams, nameA.replace('stream-', ''), nameB.replace('stream-', ''));
        const newLayout = state.swapItemByName(`stream-${nameA}`, `stream-${nameB}`)!;

        set({
          streams: state.streams,
          layout: newLayout,
        });
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

          saveLayoutToLocalStorage(newLayout, state.streams);
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

        saveLayoutToLocalStorage(newLayout, state.streams);
      },

      changeChat: (streamer: string) => {
        const state = get();
        if (!state.streams.includes(streamer) || streamer === state.activeChat) {
          return;
        }
        const newLayout = state.swapItemByName(`chat-${state.activeChat}`, `chat-${streamer}`)!;

        set({
          activeChat: streamer,
          layout: newLayout,
        });

        saveLayoutToLocalStorage(newLayout, state.streams);
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
          saveLayoutToLocalStorage(newLayout, state.streams);
        }
      },

      saveLayoutToStorage: () => {
        const state = get();
        if (state.streams.length > 0 && state.layout.length > 0) {
          saveLayoutToLocalStorage(state.layout, state.streams);
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
