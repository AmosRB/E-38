import { useEffect } from 'react';

export default function FighterMovementManager({ fighters, setFighters, aliens, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setFighters(prevFighters => {
        const updatedFighters = prevFighters.map(f => {
          if (!f.moving) return f;

          let targetLat, targetLng;

          if (f.phase === "exit") {
            if (f.route && f.positionIdx < f.route.length - 1) {
              const nextWaypoint = f.route[f.positionIdx + 1];
              targetLat = nextWaypoint[0];
              targetLng = nextWaypoint[1];

              const dLat = (targetLat - f.lat) * Math.PI / 180;
              const dLng = (targetLng - f.lng) * Math.PI / 180;
              const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
              const distanceKm = 6371 * c;

              const speedKmPerSec = (f.speed || 2350) / 3600;
              const moveRatio = speedKmPerSec / distanceKm;

              const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
              const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

              // ✅ אם positionIdx בסוף המסלול ➔ מעבר ל-chase
              if (f.positionIdx >= f.route.length - 2) {
                return { ...f, lat: newLat, lng: newLng, phase: "chase" };
              }

              return { ...f, lat: newLat, lng: newLng };
            } else {
              // אין עוד נקודות במסלול ➔ עובר ל-chase
              return { ...f, phase: "chase" };
            }
          }

          if (f.phase === "chase") {
            const targetAlien = aliens.find(a => a.id === f.targetAlienId);
            if (targetAlien) {
              const targetPos = targetAlien.route?.[targetAlien.positionIdx] || targetAlien.route?.[0];
              targetLat = targetPos[0];
              targetLng = targetPos[1];
            } else {
              // החייזר מת ➔ מעבר ל-return
              return { ...f, phase: "return" };
            }

            const dLat = (targetLat - f.lat) * Math.PI / 180;
            const dLng = (targetLng - f.lng) * Math.PI / 180;
            const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
            const distanceKm = 6371 * c;

            const speedKmPerSec = (f.speed || 2350) / 3600;
            const moveRatio = speedKmPerSec / distanceKm;

            const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
            const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

            return { ...f, lat: newLat, lng: newLng };
          }

          if (f.phase === "return") {
            if (f.homeLat !== undefined && f.homeLng !== undefined) {
              targetLat = f.homeLat;
              targetLng = f.homeLng;

              const dLat = (targetLat - f.lat) * Math.PI / 180;
              const dLng = (targetLng - f.lng) * Math.PI / 180;
              const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
              const distanceKm = 6371 * c;

              if (distanceKm < 0.05) {
                return null; // ✅ הגיע לטקילה ➔ להיעלם
              }

              const speedKmPerSec = (f.speed || 2350) / 3600;
              const moveRatio = speedKmPerSec / distanceKm;

              const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
              const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

              return { ...f, lat: newLat, lng: newLng };
            }
          }

          return f;
        });

        // מסננים לוחמים שנמחקו (חזרו לטקילה)
        const filteredFighters = updatedFighters.filter(f => f !== null);

        // מעדכנים showFightersOut בטקילות
        setTakilas(prevTakilas => prevTakilas.map(t => {
          const hasFighters = filteredFighters.some(f => f.takilaCode === t.takilaCode);
          return { ...t, showFightersOut: hasFighters };
        }));

        return filteredFighters;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, setFighters, aliens, setTakilas]);

  return null;
}
