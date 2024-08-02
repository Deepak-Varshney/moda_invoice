import { useEffect, useRef } from 'react';

export const useBarcodeScan = (onScan: (s: string) => void) => {
  const scannedCode = useRef<{ key: string; timeStamp: number }[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        scannedCode.current.length > 0 &&
        e.timeStamp - scannedCode.current.slice(-1)[0].timeStamp > 10
      ) {
        scannedCode.current = [];
      }

      if (e.key === 'Enter' && scannedCode.current.length > 0) {
        let scannedString = scannedCode.current.reduce(function (
          scannedString,
          entry
        ) {
          return scannedString + entry.key;
        }, '');
        scannedCode.current = [];
        onScan(scannedString);
      }

      if (e.key !== 'Shift') {
        let data = JSON.parse(JSON.stringify(e, ['key', 'timeStamp']));
        data.timeStampDiff =
          scannedCode.current.length > 0
            ? data.timeStamp - scannedCode.current.slice(-1)[0].timeStamp
            : 0;
        scannedCode.current.push(data);
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [onScan]);
};
