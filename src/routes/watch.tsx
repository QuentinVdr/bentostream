import ChatItem from '@/components/gridItems/ChatItem/ChatItem';
import StreamItem from '@/components/gridItems/StreamItem/StreamItem';
import GridToolsBar from '@/components/GridToolsBar/GridToolsBar';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { useStreamStore } from '@/stores/streamStore';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import ReactGridLayout, { type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export const Route = createFileRoute('/watch')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      streams: (search.streams as string[]) || [],
    };
  },
  beforeLoad: ({ search }) => {
    const streams = search.streams;
    if (!streams || streams.length === 0) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: Watch,
});

function Watch() {
  const { streams } = Route.useSearch();
  const navigate = useNavigate();
  const isDarkThemePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const { isActiveChat, layout, setOnStreamsChange, setStreams, updateLayout } = useStreamStore();

  useEffect(() => {
    setOnStreamsChange((newStreams: string[]) => {
      navigate({
        to: '/watch',
        search: { streams: newStreams },
        replace: true,
      });
    });
  }, [navigate, setOnStreamsChange]);

  useEffect(() => {
    setStreams(streams);
  }, [streams, setStreams]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    updateLayout(newLayout);
  };

  const dimensions = useWindowDimensions();
  const rowHeight = Math.max(24, Math.floor(dimensions.height / 12));

  return (
    <div className="min-h-dvh w-full">
      <GridToolsBar />
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={rowHeight}
        width={dimensions.hasVerticalScrollbar ? dimensions.width - 1 : dimensions.width}
        isDraggable
        isResizable
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        useCSSTransforms
        transformScale={1}
        verticalCompact
        onLayoutChange={handleLayoutChange}
      >
        {layout.map(item => {
          const [type, streamName] = item.i.split('-', 2);

          if (type === 'stream') {
            return (
              <div key={item.i}>
                <StreamItem streamName={streamName} />
              </div>
            );
          }

          if (type === 'chat') {
            return (
              <div key={item.i} className={isActiveChat(streamName) ? '' : 'hidden'}>
                <ChatItem streamName={streamName} isDarkThemePreferred={isDarkThemePreferred} />
              </div>
            );
          }

          return null;
        })}
      </ReactGridLayout>
    </div>
  );
}
