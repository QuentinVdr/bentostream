import type { Layout } from 'react-grid-layout';

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

export const saveLayoutToLocalStorage = (streamCount: number, layout: Layout[], activeChat: string): void => {
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

export const loadLayoutFromLocalStorage = (
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

export const generateOrLoadLayout = (
  streams: string[],
  activeChat: string
): { layout: Layout[]; activeChat: string } => {
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
