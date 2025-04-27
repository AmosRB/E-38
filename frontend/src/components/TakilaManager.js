import { useEffect } from 'react';
import getRoute from '../utils/getRoute';

export default function TakilaManager({ takilas, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      setTakilas(prevTakilas => {
        const updatedTakilas = prevTakilas.map(t => {
          if (t.showFightersOut) {
            // ❗ יש לוחמים בחוץ ➔ לא להזיז את הטקילה
            return t;
          }

          if (!t.route || t.route.length === 0) return t;

          const nextIdx = (t.positionIdx ?? 0) + 1;

          if (nextIdx < t.route.length) {
            return {
              ...t,
              lat: t.route[nextIdx][0],
              lng: t.route[nextIdx][1],
              positionIdx: nextIdx,
              lastUpdated: Date.now()
            };
          }

          return t;
        });

        return updatedTakilas;
      });

      // עכשיו נבדוק גם אם טקילה סיימה את המסלול ➔ יוצרים לה מסלול חדש
      for (const t of takilas) {
        if (!t.route || t.positionIdx >= t.route.length - 1) {
          let success = false;
          for (let attempt = 0; attempt < 3; attempt++) {
            const randomLat = t.lat + (Math.random() - 0.5) * 0.1;
            const randomLng = t.lng + (Math.random() - 0.5) * 0.1;
            const newRoute = await getRoute([t.lat, t.lng], [randomLat, randomLng]);

            if (newRoute.length > 1) {
              setTakilas(prevTakilas => prevTakilas.map(prev => {
                if (prev.id === t.id) {
                  return {
                    ...prev,
                    route: newRoute,
                    positionIdx: 0
                  };
                }
                return prev;
              }));
              success = true;
              break;
            }
          }

          if (!success) {
            console.warn(`❗ Failed to find new route for takila ${t.id}`);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [takilas, setTakilas]);

  return null;
}
