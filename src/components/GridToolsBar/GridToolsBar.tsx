import { memo, useState } from 'react';
import { useStreamStore } from '../../stores/streamStore';

const GridToolsBar = memo(() => {
  const { streams, hiddenStreams, toggleStreamVisibility, isStreamHidden, showAllStreams, hideAllStreams } =
    useStreamStore();

  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const visibleCount = streams.length - hiddenStreams.size;
  const allVisible = hiddenStreams.size === 0;
  const allHidden = hiddenStreams.size === streams.length;

  if (streams.length === 0) {
    return null;
  }

  const toggleToolbar = () => {
    setIsToolbarVisible(!isToolbarVisible);
  };

  return (
    <>
      {/* Main toolbar with integrated toggle button */}
      <div
        className={`fixed left-1/2 z-50 -translate-x-1/2 transform rounded-b-xl border-r border-b border-l transition-all duration-500 ease-out ${
          isToolbarVisible
            ? 'top-0 border-gray-300/10 bg-zinc-900/80 shadow-2xl backdrop-blur-md'
            : 'top-0 border-transparent bg-transparent shadow-none'
        }`}
      >
        <div className={`flex items-center px-4 ${isToolbarVisible ? 'gap-3 py-2' : 'justify-center gap-0 py-0'}`}>
          {/* Toggle button */}
          <button
            onClick={toggleToolbar}
            className={`group border border-gray-300/10 bg-zinc-800/50 text-xs font-light text-gray-400 backdrop-blur-md transition-all duration-300 hover:border-gray-300/30 hover:bg-zinc-700/60 hover:text-gray-200 ${
              isToolbarVisible
                ? 'rounded-full px-2 py-0.5'
                : 'rounded-b-2xl border-gray-300/20 bg-zinc-900/70 px-3 pb-1'
            }`}
            title={isToolbarVisible ? 'Hide toolbar' : 'Show toolbar'}
          >
            <div className="flex items-center justify-center">
              <span
                className={`transform transition-all duration-300 ease-out group-hover:scale-110 ${isToolbarVisible ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </div>
          </button>

          {/* Toolbar content - only shown when expanded */}
          {isToolbarVisible && (
            <>
              <span className="text-sm font-medium text-gray-300">Streams:</span>

              {/* Control buttons */}
              <div className="flex gap-1">
                <button
                  onClick={showAllStreams}
                  disabled={allVisible}
                  className={`rounded px-2 py-1 text-xs font-medium transition-all duration-200 ${
                    allVisible
                      ? 'cursor-not-allowed bg-gray-700/50 text-gray-500'
                      : 'bg-green-600 text-white hover:scale-105 hover:bg-green-700 active:scale-95'
                  } `}
                  title="Show all streams"
                >
                  Show All
                </button>
                <button
                  onClick={hideAllStreams}
                  disabled={allHidden}
                  className={`rounded px-2 py-1 text-xs font-medium transition-all duration-200 ${
                    allHidden
                      ? 'cursor-not-allowed bg-gray-700/50 text-gray-500'
                      : 'bg-red-600 text-white hover:scale-105 hover:bg-red-700 active:scale-95'
                  } `}
                  title={allHidden ? 'All streams are already hidden' : 'Hide all streams'}
                >
                  Hide All
                </button>
              </div>

              {/* Stream toggle buttons */}
              <div className="flex flex-wrap gap-2">
                {streams.map(streamName => {
                  const isHidden = isStreamHidden(streamName);
                  return (
                    <button
                      key={streamName}
                      onClick={() => toggleStreamVisibility(streamName)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${
                        isHidden
                          ? 'border border-gray-500/30 bg-gray-600/50 text-gray-400'
                          : 'border border-purple-500 bg-purple-600 text-white hover:bg-purple-700'
                      } hover:scale-105 active:scale-95`}
                      title={isHidden ? `Show ${streamName}` : `Hide ${streamName}`}
                    >
                      {streamName}
                    </button>
                  );
                })}
              </div>

              {/* Status indicator */}
              <div className="text-xs text-gray-400">
                {visibleCount}/{streams.length} visible
              </div>
            </>
          )}

          {/* Hidden streams indicator - only visible when collapsed */}
          {!isToolbarVisible && hiddenStreams.size > 0 && (
            <span
              className="rounded-full bg-orange-500/80 px-2 py-0.5 text-[9px] font-medium text-white transition-all duration-200"
              title={`${hiddenStreams.size} streams hidden`}
            >
              {hiddenStreams.size}
            </span>
          )}
        </div>
      </div>
    </>
  );
});

GridToolsBar.displayName = 'GridToolsBar';

export default GridToolsBar;
