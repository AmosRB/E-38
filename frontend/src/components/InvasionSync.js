import { useEffect } from 'react';
import getRoute from '../utils/getRoute';

export default function AlienManager({ aliens, setAliens }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await Promise.all(
        aliens.map(async alien => {
          const newIdx = alien.positionIdx + 1;

          // אם הגיע לסוף המסלול או שהמסלול לא קיים - צור מסלול חדש
          if (!alien.route || alien.route.length <= 1 || newIdx >= alien.route.length) {
            const from = alien.route?.[alien.route.length - 1] || [31.5, 34.8];
            const angle = Math.random() * 360;
            const to = [
              from[0] + 0.05 * Math.cos(angle * Math.PI / 180),
              from[1] + 0.05 * Math.sin(angle * Math.PI / 180)
            ];
            const route = await getRoute(from, to);

            return {
              ...alien,
              route: route.length > 1 ? route : [from, from],
              positionIdx: 0,
              lastUpdated: Date.now()
            };
          }

          // המשך במסלול קיים
          return {
            ...alien,
            positionIdx: newIdx,
            lastUpdated: Date.now()
          };
        })
      );

      setAliens(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [aliens, setAliens]);

  return null;
}