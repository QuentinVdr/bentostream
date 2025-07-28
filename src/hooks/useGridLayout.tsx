import { useMemo } from 'react';
import type { Layout } from 'react-grid-layout';

export const useGridLayout = (streams: string[]): Layout[] => {
  return useMemo(() => {
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

    return layout;
  }, [streams]);
};

export default useGridLayout;
