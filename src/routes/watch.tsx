import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import RGL, { WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import StreamGridItem from '../components/StreamGridItem/StreamGridItem';
import { useWindowDimensions } from '../hooks/useWindowDimensions';
import { useStreamStore } from '../stores/streamStore';

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

  const { streams: storeStreams, activeChatStreamer, layout, setStreams, updateLayout } = useStreamStore();

  useEffect(() => {
    setStreams(streams);
  }, [streams, setStreams]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    updateLayout(newLayout);
  };

  const dimensions = useWindowDimensions(100);
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
        useCSSTransforms
        transformScale={1}
        compactType={null}
        preventCollision
        onLayoutChange={handleLayoutChange}
      >
        {storeStreams.map((streamName: string) => (
          <div key={`stream-${streamName}`}>
            <StreamGridItem streamName={streamName} />
          </div>
        ))}
            <StreamGridItem streamName={streamName} isChat isDarkThemePreferred={isDarkThemePreferred} />
      </ReactGridLayout>
    </div>
  );
}
