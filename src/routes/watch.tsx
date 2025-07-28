import { createFileRoute, redirect } from '@tanstack/react-router';
import { useMemo } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import StreamGridItem from '../components/StreamGridItem/StreamGridItem';
import { useGridLayout } from '../hooks/useGridLayout';
import { useWindowDimensions } from '../hooks/useWindowDimensions';

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

  const dimensions = useWindowDimensions(100);
  const layout = useGridLayout(streams);

  const rowHeight = useMemo(() => Math.floor(dimensions.height / 12), [dimensions.height]);

  return (
    <div className="h-dvh w-dvw">
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={rowHeight}
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
