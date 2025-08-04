import { memo, type ReactNode } from 'react';

interface StreamGridHeaderProps {
  title: string;
  children?: ReactNode;
}

const GridItemHeader = memo(({ title, children }: StreamGridHeaderProps) => {
  return (
    <div className="absolute z-10 w-full origin-top scale-y-0 transform-gpu transition-transform duration-300 ease-in-out group-hover:scale-y-100">
      <div className="flex flex-row items-center gap-6 bg-zinc-900 px-4 py-2 text-center backdrop-blur-sm">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <div className="mt-1 flex justify-center gap-2">{children}</div>
      </div>
    </div>
  );
});

GridItemHeader.displayName = 'GridItemHeader';

export default GridItemHeader;
