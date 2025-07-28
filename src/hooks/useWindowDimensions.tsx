import { useEffect, useMemo, useState } from 'react';
import debounce from '../utils/DebounceUtils';

interface WindowDimensions {
  width: number;
  height: number;
}

export const useWindowDimensions = (debounceMs = 100): WindowDimensions => {
  const [dimensions, setDimensions] = useState<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const debouncedResize = useMemo(
    () =>
      debounce(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  return dimensions;
};

export default useWindowDimensions;
