import { useCallback, useMemo, useState } from 'react';

export interface StreamManagerState {
  streamOrder: string[];
  activeChatStreamer: string;
}

export interface StreamManagerActions {
  swapStreams: (indexA: number, indexB: number) => void;
  swapStreamsByName: (streamA: string, streamB: string) => void;
  moveStreamToPosition: (streamName: string, newIndex: number) => void;
  changeChatStreamer: (streamerName: string) => void;
  resetToInitialOrder: () => void;
}

export interface UseStreamManagerReturn extends StreamManagerState, StreamManagerActions {
  getStreamIndex: (streamName: string) => number;
  isActiveChatStreamer: (streamName: string) => boolean;
}

export const useStreamManager = (initialStreams: string[]): UseStreamManagerReturn => {
  const [streamOrder, setStreamOrder] = useState<string[]>(initialStreams);
  const [activeChatStreamer, setActiveChatStreamer] = useState<string>(initialStreams[0] || '');

  const swapStreams = useCallback((indexA: number, indexB: number) => {
    setStreamOrder(current => {
      if (indexA < 0 || indexB < 0 || indexA >= current.length || indexB >= current.length) {
        return current;
      }
      const newOrder = [...current];
      [newOrder[indexA], newOrder[indexB]] = [newOrder[indexB], newOrder[indexA]];
      return newOrder;
    });
  }, []);

  const swapStreamsByName = useCallback((streamA: string, streamB: string) => {
    setStreamOrder(current => {
      const indexA = current.indexOf(streamA);
      const indexB = current.indexOf(streamB);

      if (indexA === -1 || indexB === -1) {
        return current;
      }

      const newOrder = [...current];
      [newOrder[indexA], newOrder[indexB]] = [newOrder[indexB], newOrder[indexA]];
      return newOrder;
    });
  }, []);

  const moveStreamToPosition = useCallback((streamName: string, newIndex: number) => {
    setStreamOrder(current => {
      const currentIndex = current.indexOf(streamName);
      if (currentIndex === -1 || newIndex < 0 || newIndex >= current.length || currentIndex === newIndex) {
        return current;
      }

      const newOrder = [...current];
      const [movedStream] = newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, movedStream);
      return newOrder;
    });
  }, []);

  const changeChatStreamer = useCallback(
    (streamerName: string) => {
      if (streamOrder.includes(streamerName)) {
        setActiveChatStreamer(streamerName);
      }
    },
    [streamOrder]
  );

  const resetToInitialOrder = useCallback(() => {
    setStreamOrder(initialStreams);
    setActiveChatStreamer(initialStreams[0] || '');
  }, [initialStreams]);

  const getStreamIndex = useCallback(
    (streamName: string) => {
      return streamOrder.indexOf(streamName);
    },
    [streamOrder]
  );

  const isActiveChatStreamer = useCallback(
    (streamName: string) => {
      return activeChatStreamer === streamName;
    },
    [activeChatStreamer]
  );

  useMemo(() => {
    if (activeChatStreamer && !streamOrder.includes(activeChatStreamer)) {
      setActiveChatStreamer(streamOrder[0] || '');
    }
  }, [streamOrder, activeChatStreamer]);

  return {
    streamOrder,
    activeChatStreamer,
    swapStreams,
    swapStreamsByName,
    moveStreamToPosition,
    changeChatStreamer,
    resetToInitialOrder,
    getStreamIndex,
    isActiveChatStreamer,
  };
};
