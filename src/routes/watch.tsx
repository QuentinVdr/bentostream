import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import StreamGridItem from '../components/StreamGridItem/StreamGridItem';

export const Route = createFileRoute('/watch')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      streams: (search.streams as string[]) || [],
    };
  },
  beforeLoad: ({ search }) => {
    const streams = search.streams as string[];
    if (!streams || streams.length === 0) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: Watch,
});

const ReactGridLayout = WidthProvider(RGL);

function Watch() {
  const { streams } = Route.useSearch();
  const isDarkThemePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // State for responsive dimensions
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create layout configuration for grid items
  const createLayout = () => {
    const layout = [];
    const streamCount = streams.length;

    if (streamCount === 1) {
      // Single stream takes most space, chat on the side
      layout.push({
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 9,
        h: 8,
        minW: 6,
        minH: 4,
      });
      layout.push({
        i: `chat-${streams[0]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 8,
        minW: 2,
        minH: 4,
        maxW: 4,
      });
    } else if (streamCount === 2) {
      // Two streams stacked vertically, chat on the side
      layout.push({
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 9,
        h: 6,
        minW: 4,
        minH: 4,
      });
      layout.push({
        i: `stream-${streams[1]}`,
        x: 0,
        y: 6,
        w: 9,
        h: 6,
        minW: 4,
        minH: 4,
      });
      layout.push({
        i: `chat-${streams[0]}`,
        x: 9,
        y: 0,
        w: 3,
        h: 12,
        minW: 3,
        minH: 6,
        maxW: 4,
      });
    } else if (streamCount === 3) {
      // Three streams: 2 on top, 1 below with chat
      layout.push({
        i: `stream-${streams[0]}`,
        x: 0,
        y: 0,
        w: 6,
        h: 5,
        minW: 4,
        minH: 3,
      });
      layout.push({
        i: `stream-${streams[1]}`,
        x: 6,
        y: 0,
        w: 6,
        h: 5,
        minW: 4,
        minH: 3,
      });
      layout.push({
        i: `stream-${streams[2]}`,
        x: 0,
        y: 5,
        w: 8,
        h: 5,
        minW: 4,
        minH: 3,
      });
      layout.push({
        i: `chat-${streams[0]}`,
        x: 8,
        y: 5,
        w: 4,
        h: 5,
        minW: 3,
        minH: 3,
        maxW: 4,
      });
    } else {
      // Four or more streams: grid layout with dedicated chat space
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

      // Add chat in a dedicated area (bottom right, limited width)
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
  };

  return (
    <div className="h-dvh w-dvw">
      <ReactGridLayout
        className="layout"
        layout={createLayout()}
        cols={12}
        rowHeight={Math.floor(dimensions.height / 12)}
        width={dimensions.width}
        isDraggable
        isResizable
        margin={[0, 0]}
        containerPadding={[0, 0]}
      >
        {streams.map(streamName => (
          <div key={`stream-${streamName}`}>
            <StreamGridItem streamName={streamName} />
          </div>
        ))}
        <div key={`chat-${streams[0]}`}>
          <StreamGridItem streamName={streams[0]} isChat isDarkThemePreferred={isDarkThemePreferred} />
        </div>
      </ReactGridLayout>
    </div>
  );
}
