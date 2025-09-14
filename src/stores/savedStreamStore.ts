import type { SavedStream } from '@/types/SavedStream';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const SAVED_STREAMS_KEY = 'bentostream_saved_streams';
const CURRENT_VERSION = 1; // Current version of the data structure
const MAX_SAVED = 50; // Max number of saved streams to keep

type SavedStreamV1 = {
  name: string;
  lastUseDate: string; // Date is serialized as string in localStorage
  version: number;
};

// Migration functions
const migrateV0ToV1 = (data: string): SavedStreamV1 => ({
  name: data.toLowerCase(),
  lastUseDate: new Date().toISOString(),
  version: 1,
});

const migrateData = (rawData: unknown[]): SavedStreamV1[] => {
  return rawData
    .map(item => {
      // If item is a string, it's V0 (legacy)
      if (typeof item === 'string') {
        return migrateV0ToV1(item);
      }

      // If item is already current version, return as is
      if (typeof item === 'object' && item !== null && (item as SavedStreamV1).version === CURRENT_VERSION) {
        return item as SavedStreamV1;
      }

      // Handle other future migrations here
      return item as SavedStreamV1;
    })
    .filter(Boolean);
};

const loadSavedStreams = (): SavedStream[] => {
  try {
    const rawData: unknown[] = JSON.parse(localStorage.getItem(SAVED_STREAMS_KEY) || '[]');

    const migratedData = migrateData(rawData);

    const validStreams = migratedData
      .map((savedStream: SavedStreamV1) => ({
        ...savedStream,
        lastUseDate: new Date(savedStream.lastUseDate),
        version: CURRENT_VERSION,
      }))
      .sort((a, b) => b.lastUseDate.getTime() - a.lastUseDate.getTime()) // Sort by most recent
      .slice(0, MAX_SAVED); // Keep only the most recent

    localStorage.setItem(SAVED_STREAMS_KEY, JSON.stringify(validStreams));

    return validStreams;
  } catch (error) {
    console.error('Error loading saved streams:', error);
    localStorage.removeItem(SAVED_STREAMS_KEY);
    return [];
  }
};

interface SavedStreamStore {
  savedStreams: SavedStream[];
  saveStream: (streamer: string) => void;
  saveStreams: (streamers: string[]) => void;
}

const addNewSavedStream = (streams: SavedStream[], newStream: string): SavedStream[] => {
  const lower = newStream.toLowerCase();
  const idx = streams.findIndex(s => s.name === lower);
  let newSavedStreams: SavedStream[];
  if (idx !== -1) {
    const updated = { ...streams[idx], lastUseDate: new Date(), version: CURRENT_VERSION };
    newSavedStreams = [updated, ...streams.filter((_, i) => i !== idx)];
  } else {
    newSavedStreams = [{ name: lower, lastUseDate: new Date(), version: CURRENT_VERSION }, ...streams];
  }
  return newSavedStreams.slice(0, MAX_SAVED);
};

export const useSavedStreamStore = create<SavedStreamStore>()(
  devtools(
    set => ({
      savedStreams: loadSavedStreams(),
      saveStream: (streamer: string) => {
        set(state => {
          const next = addNewSavedStream([...state.savedStreams], streamer);
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(SAVED_STREAMS_KEY, JSON.stringify(next));
            } catch {
              console.error('Error saving to localStorage');
            }
          }
          return { savedStreams: next };
        });
      },
      saveStreams: (streamers: string[]) => {
        set(state => {
          const next = streamers.reduce((acc, s) => addNewSavedStream(acc, s), [...state.savedStreams]);
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem(SAVED_STREAMS_KEY, JSON.stringify(next));
            } catch {
              console.error('Error saving to localStorage');
            }
          }
          return { savedStreams: next };
        });
      },
    }),
    { name: 'savedStream' }
  )
);
