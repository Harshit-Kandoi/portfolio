import { useEffect, useState } from 'react';

const query = '(pointer: coarse)';
export default function useTouchDevice() {
  const [touch, setTouch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setTouch(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return touch;
}
