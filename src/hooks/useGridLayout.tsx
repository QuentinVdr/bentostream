import { useMemo } from 'react';
import type { Layout } from 'react-grid-layout';

export const useGridLayout = (streams: string[]): Layout[] => {
  return useMemo(() => {
    const layout: Layout[] = [];
    const streamCount = streams.length;

    if (streamCount === 1) {
      // Single stream layout
      layout.push(
        {
          i: `stream-${streams[0]}`,
          x: 0,
          y: 0,
          w: 9,
          h: 8,
          minW: 6,
          minH: 4,
        },
        {
          i: `chat-${streams[0]}`,
          x: 9,
          y: 0,
          w: 3,
          h: 8,
          minW: 2,
          minH: 4,
          maxW: 4,
        }
      );
    } else if (streamCount === 2) {
      // Two streams layout
      layout.push(
        {
          i: `stream-${streams[0]}`,
          x: 0,
          y: 0,
          w: 9,
          h: 6,
          minW: 4,
          minH: 4,
        },
        {
          i: `stream-${streams[1]}`,
          x: 0,
          y: 6,
          w: 9,
          h: 6,
          minW: 4,
          minH: 4,
        },
        {
          i: `chat-${streams[0]}`,
          x: 9,
          y: 0,
          w: 3,
          h: 12,
          minW: 3,
          minH: 6,
          maxW: 4,
        }
      );
    } else if (streamCount === 3) {
      // Three streams layout
      layout.push(
        {
          i: `stream-${streams[0]}`,
          x: 0,
          y: 0,
          w: 6,
          h: 5,
          minW: 4,
          minH: 3,
        },
        {
          i: `stream-${streams[1]}`,
          x: 6,
          y: 0,
          w: 6,
          h: 5,
          minW: 4,
          minH: 3,
        },
        {
          i: `stream-${streams[2]}`,
          x: 0,
          y: 5,
          w: 8,
          h: 5,
          minW: 4,
          minH: 3,
        },
        {
          i: `chat-${streams[0]}`,
          x: 8,
          y: 5,
          w: 4,
          h: 5,
          minW: 3,
          minH: 3,
          maxW: 4,
        }
      );
    } else {
      // Four or more streams layout
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
          minW: 3,
          minH: 3,
        });
      });

      const chatRow = Math.ceil(streamCount / cols);
      layout.push({
        i: `chat-${streams[0]}`,
        x: 8,
        y: chatRow,
        w: 4,
        h: 4,
        minW: 3,
        minH: 3,
        maxW: 4,
      });
    }

    return layout;
  }, [streams]);
};

export default useGridLayout;
