import { createFileRoute, redirect } from '@tanstack/react-router';
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

  // Create layout configuration for grid items
  const createLayout = () => {
    const layout = [];
    const streamCount = streams.length;
    const cols = Math.ceil(Math.sqrt(streamCount));

    // Add stream panels
    streams.forEach((streamName, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      layout.push({
        i: `stream-${streamName}`,
        x: col * (12 / cols),
        y: row,
        w: 12 / cols,
        h: 6,
        minW: 3,
        minH: 3,
      });
    });

    // Add chat panel if odd number of streams
    if (streamCount % 2 !== 0) {
      layout.push({
        i: `chat-${streams[0]}`,
        x: 6,
        y: Math.ceil(streamCount / cols),
        w: 6,
        h: 6,
        minW: 3,
        minH: 3,
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
        rowHeight={60}
        width={window.innerWidth}
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
        {streams.length % 2 !== 0 && (
          <div key={`chat-${streams[0]}`}>
            <StreamGridItem streamName={streams[0]} isChat isDarkThemePreferred={isDarkThemePreferred} />
          </div>
        )}
      </ReactGridLayout>
    </div>
  );
}
