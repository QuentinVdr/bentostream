import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const SAVED_STREAMS_KEY = 'bentostream_saved_streams';

interface SavedStreamStore {
  savedStreams: string[];
  saveStream: (streamer: string) => void;
  saveStreams: (streamers: string[]) => void;
}

export const useSavedStreamStore = create<SavedStreamStore>()(
  devtools(
    (set, get) => ({
      savedStreams: JSON.parse(localStorage.getItem(SAVED_STREAMS_KEY) || '[]'),
      saveStream: (streamer: string) => {
        const state = get();
        if (!state.savedStreams.includes(streamer.toLowerCase())) {
          const newSavedStreams = [...state.savedStreams, streamer.toLowerCase()];
          set({ savedStreams: newSavedStreams });
          localStorage.setItem(SAVED_STREAMS_KEY, JSON.stringify(newSavedStreams));
        }
      },
      saveStreams: (streamers: string[]) => {
        const state = get();
        const newSavedStreams = [...state.savedStreams];
        streamers.forEach(streamer => {
          const lowerCasedStreamer = streamer.toLowerCase();
          if (!newSavedStreams.includes(lowerCasedStreamer)) {
            newSavedStreams.push(lowerCasedStreamer);
          }
        });
        set({ savedStreams: newSavedStreams });
        localStorage.setItem(SAVED_STREAMS_KEY, JSON.stringify(newSavedStreams));
      },
    }),
    { name: 'savedStream' }
  )
);
