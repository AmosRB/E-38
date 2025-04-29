import { useEffect } from 'react';

export default function FighterMovementManager({ fighters, setFighters, aliens }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setFighters(prev =>
        prev
          .map(f => {
            if (!Array.isArray(f.route) || f.route.length === 0 || typeof f.positionIdx !== 'number') return f;

            const current = f.route[f.positionIdx];
            const next = f.route[f.positionIdx + 1];

            if (!current || !next) {
              if (f.phase === 'exit') {
                return {
                  ...f,
                  phase: 'return',
                  route: [[f.lat || 0, f.lng || 0], [f.homeLat || 0, f.homeLng || 0]],
                  positionIdx: 0
                };
              }
              if (f.phase === 'return') {
                const d = Math.sqrt(
                  ((f.lat || 0) - (f.homeLat || 0)) ** 2 +
                  ((f.lng || 0) - (f.homeLng || 0)) ** 2
                );
                return d < 0.0005 ? null : f;
              }
              return f;
            }

            const moveLat = next[0] - current[0];
            const moveLng = next[1] - current[1];
            const dist = Math.sqrt(moveLat ** 2 + moveLng ** 2);
            const step = (f.speed || 2000) / 100000;

            if (dist < step) {
              return { ...f, positionIdx: f.positionIdx + 1 };
            }

            return {
              ...f,
              lat: current[0] + moveLat * (step / dist),
              lng: current[1] + moveLng * (step / dist)
            };
          })
          .filter(Boolean)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [setFighters, aliens]);

  return null;
}
