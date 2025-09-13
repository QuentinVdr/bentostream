import { memo, type ReactNode } from 'react';

interface GridItemHeaderProps {
  title: string;
  children?: ReactNode;
  streamName?: string;
}

const propsEqual = (a: Readonly<{ title: string; streamName?: string } & { children?: ReactNode }>, b: typeof a) =>
  a.title === b.title && a.streamName === b.streamName;

const GridItemHeader = memo(({ title, children, streamName }: GridItemHeaderProps) => {
  return (
    <div className="absolute z-10 w-full origin-top scale-y-0 transform-gpu cursor-grab transition-transform duration-300 ease-in-out group-hover:scale-y-100 active:cursor-grabbing">
      <div className="flex flex-row items-center gap-6 bg-zinc-900 px-4 py-2 text-center backdrop-blur-sm">
        {streamName ? (
          <a
            href={`https://www.twitch.tv/${streamName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-left text-base font-semibold text-white no-underline transition-colors duration-200 hover:text-purple-400"
            title={`Visit ${streamName} on Twitch`}
            aria-label={`Visit ${streamName} on Twitch`}
            onPointerDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            {title}
          </a>
        ) : (
          <h2 className="text-base font-semibold text-white">{title}</h2>
        )}
        <div className="flex grow items-center gap-2">{children}</div>
      </div>
    </div>
  );
}, propsEqual);

GridItemHeader.displayName = 'GridItemHeader';

export default GridItemHeader;
