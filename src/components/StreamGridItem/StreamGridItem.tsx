const StreamGridItem = ({
  streamName,
  isChat,
  isDarkThemePreferred,
}: {
  streamName: string;
  isChat?: boolean;
  isDarkThemePreferred?: boolean;
}) => {
  return (
    <div className="flex h-full w-full flex-col flex-nowrap overflow-hidden rounded border border-gray-300/20 bg-zinc-900">
      <div>
        <h2 className="text-center text-base font-semibold">
          {isChat ? `Chat: ${streamName}` : `Stream: ${streamName}`}
        </h2>
      </div>
      {isChat ? (
        <iframe
          title={`Twitch Chat: ${streamName}`}
          src={`https://www.twitch.tv/embed/${streamName}/chat?parent=${window.location.hostname}${isDarkThemePreferred ? '&darkpopout' : ''}`}
          height="100%"
          width="100%"
        />
      ) : (
        <iframe
          title={`Twitch Stream: ${streamName}`}
          src={`https://player.twitch.tv/?channel=${streamName}&parent=${window.location.hostname}`}
          height="100%"
          width="100%"
          allowFullScreen={true}
        />
      )}
    </div>
  );
};

export default StreamGridItem;
