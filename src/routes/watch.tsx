import { createFileRoute, redirect } from '@tanstack/react-router';

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

function Watch() {
  const { streams } = Route.useSearch();
  const isEven = streams.length % 2 === 0;
  const firstStream = streams[0];

  const isDarkThemePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="flex h-dvh w-dvw">
      {streams.map(streamName => (
        <iframe
          key={streamName}
          title={`Twitch Stream: ${streamName}`}
          src={`https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`}
          height="100%"
          width="100%"
        />
      ))}
      {!isEven && (
        <iframe
          key={firstStream}
          title={`Twitch Stream: ${firstStream}`}
          src={`https://www.twitch.tv/embed/${firstStream}/chat?parent=${window.location.hostname}${isDarkThemePreferred ? '&darkpopout' : ''}`}
          height="100%"
          width="100%"
        />
      )}
    </div>
  );
}
