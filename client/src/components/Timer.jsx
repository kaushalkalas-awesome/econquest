/** Countdown seconds for challenges */
import { useEffect, useRef, useState } from 'react';

export default function Timer({ seconds, onExpire, active }) {
  const [left, setLeft] = useState(seconds);
  const cb = useRef(onExpire);
  cb.current = onExpire;

  useEffect(() => {
    setLeft(seconds);
  }, [seconds, active]);

  useEffect(() => {
    if (!active) return undefined;
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          cb.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, seconds]);

  const color = left > 15 ? 'text-green-400' : left > 5 ? 'text-yellow-400' : 'text-red-400 animate-pulse';

  return (
    <div className={`text-2xl font-mono font-bold ${color}`}>
      {left}s
    </div>
  );
}
