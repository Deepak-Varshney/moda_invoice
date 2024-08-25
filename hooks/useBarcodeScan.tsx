import { useEffect, useRef } from 'react';

export const useBarcodeScan = (
  onScan: (s: string) => void,
  resetTime: number = 100
) => {
  const scannedCode = useRef<{ key: string; timeStamp: number }[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const now = e.timeStamp;

      if (
        scannedCode.current.length > 0 &&
        now - scannedCode.current.slice(-1)[0].timeStamp > resetTime
      ) {
        scannedCode.current = [];
      }

      if (e.key === 'Enter' && scannedCode.current.length > 0) {
        const scannedString = scannedCode.current
          .map((entry) => entry.key)
          .join('');
        scannedCode.current = [];
        onScan(scannedString);
      } else if (e.key.length === 1 && e.key !== 'Shift') {
        scannedCode.current.push({ key: e.key, timeStamp: now });
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [onScan, resetTime]);
};
