import { useState } from 'react';
import { useStreamStore } from '../../stores/streamStore';
import StreamsFormPopup from '../StreamFormPopup/StreamsFormPopup';

const GridToolsBar = () => {
  const { streams, setStreams, resetLayoutForStreamCount, saveLayoutToStorage } = useStreamStore();

  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  if (streams.length === 0) {
    return null;
  }

  const toggleToolbar = () => {
    setIsToolbarVisible(!isToolbarVisible);
  };

  const handleEditStreams = () => {
    setIsEditPopupOpen(true);
  };

  const handleUpdateStreams = (newStreams: string[]) => {
    setStreams(newStreams, true);
  };

  const handleResetLayout = () => {
    resetLayoutForStreamCount(streams.length);
  };

  const handleSaveLayout = () => {
    saveLayoutToStorage();
  };

  return (
    <>
      {/* Main toolbar with integrated toggle button */}
      <div
        className={`fixed left-1/2 z-50 -translate-x-1/2 transform rounded-b-xl border-r border-b border-l transition-all duration-500 ease-out ${
          isToolbarVisible
            ? 'top-0 border-gray-300/10 bg-zinc-900/60 shadow-2xl backdrop-blur-md'
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
              <span className="text-sm font-medium text-gray-300">Streams ({streams.length})</span>

              {/* Control buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleEditStreams}
                  className="rounded bg-violet-600 px-2 py-1 text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-violet-700 active:scale-95"
                  title="Edit streams list"
                >
                  Edit Streams
                </button>

                <button
                  onClick={handleSaveLayout}
                  className="rounded border border-green-600 px-2 py-1 text-xs font-medium text-green-600 transition-all duration-200 hover:scale-105 hover:bg-green-600 hover:text-white active:scale-95"
                  title="Save current layout for this stream count"
                >
                  Save Layout
                </button>

                <button
                  onClick={handleResetLayout}
                  className="rounded border border-orange-600 px-2 py-1 text-xs font-medium text-orange-600 transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:text-white active:scale-95"
                  title="Reset layout to default for this stream count"
                >
                  Reset Layout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Streams Edit Popup */}
      <StreamsFormPopup
        key={`popup-${streams.join('-')}`}
        isOpen={isEditPopupOpen}
        onClose={() => setIsEditPopupOpen(false)}
        onSubmit={handleUpdateStreams}
        initialStreams={streams}
      />
    </>
  );
};

export default GridToolsBar;
