import type { Layout } from 'react-grid-layout';

interface SavedLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'stream' | 'chat';
  index: number;
}

interface SavedLayout {
  items: SavedLayoutItem[];
  version: number;
}

const LAYOUT_STORAGE_KEY_PREFIX = 'bentostream-layout';
const LAYOUT_VERSION = 3;

export const getLayoutStorageKey = (streamCount: number): string => {
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

export const clearAllStoredLayouts = (): void => {
  try {
    const layoutKeys = getAllLayoutStorageKeys();
    layoutKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear all layouts:', error);
  }
};

export const saveLayoutToLocalStorage = (layout: Layout[], streams: string[]): void => {
  try {
    const storageKey = getLayoutStorageKey(streams.length);

    const savedLayout: SavedLayout = {
      items: [],
      version: LAYOUT_VERSION,
    };

    layout.forEach(item => {
      const [type, ...nameParts] = item.i.split('-');
      const name = nameParts.join('-');

      if (type === 'stream') {
        savedLayout.items.push({
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          type: 'stream',
          index: streams.indexOf(name),
        });
      } else if (type === 'chat' && item.w > 0 && item.h > 0) {
        savedLayout.items.push({
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          type: 'chat',
          index: 0,
        });
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(savedLayout));
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
};

export const loadLayoutFromLocalStorage = (
  streamCount: number,
  streams: string[],
  requestedActiveChat: string
): { layout: Layout[] | null; activeChat: string } => {
  try {
    const storageKey = getLayoutStorageKey(streamCount);
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return { layout: null, activeChat: '' };
    }

    const savedLayout: SavedLayout = JSON.parse(saved);

    if (savedLayout.version < LAYOUT_VERSION) {
      localStorage.removeItem(storageKey);
      return { layout: null, activeChat: '' };
    }

    const activeChat = requestedActiveChat || streams[0];
    let isActiveChatSet = false;

    const layout: Layout[] = savedLayout.items
      .map(item => {
        if (item.type === 'stream') {
          return { i: `stream-${streams[item.index]}`, x: item.x, y: item.y, w: item.w, h: item.h } as Layout;
        } else if (item.type === 'chat') {
          isActiveChatSet = true;
          return { i: `chat-${activeChat}`, x: item.x, y: item.y, w: item.w, h: item.h } as Layout;
        }
        return undefined;
      })
      .filter((item): item is Layout => item !== undefined);

    if (!isActiveChatSet) {
      if (requestedActiveChat) {
        layout.push({ i: `chat-${requestedActiveChat}`, x: 9, y: 0, w: 3, h: 8 });
      } else {
        layout.push({ i: `chat-${streams[0]}`, x: 0, y: 0, w: 0, h: 0 });
      }
    }

    layout.push(
      ...streams
        .filter(stream => stream !== activeChat)
        .map(stream => ({ i: `chat-${stream}`, x: 0, y: 0, w: 0, h: 0 }) as Layout)
    );

    return { layout, activeChat: isActiveChatSet ? activeChat : '' };
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return { layout: null, activeChat: '' };
  }
};

export const generateDefaultLayout = (
  streams: string[],
  activeChat?: string
): { layout: Layout[]; activeChat: string } => {
  const streamCount = streams.length;

  if (streamCount === 0) {
    return { layout: [], activeChat: '' };
  }

  const layout: Layout[] = [];
  activeChat = activeChat || streams[0];

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

export const generateOrLoadLayout = (
  streams: string[],
  activeChat: string
): { layout: Layout[]; activeChat: string } => {
  const streamCount = streams.length;

  if (streamCount === 0) {
    return { layout: [], activeChat: '' };
  }

  const { layout: savedLayout, activeChat: loadedActiveChat } = loadLayoutFromLocalStorage(
    streamCount,
    streams,
    activeChat
  );

  if (savedLayout) {
    return { layout: savedLayout, activeChat: loadedActiveChat };
  }

  return generateDefaultLayout(streams, activeChat);
};
