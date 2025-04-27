import { useEffect } from 'react';

export default function FighterMovementManager({ fighters, setFighters, aliens }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setFighters(prevFighters => {
        const updatedFighters = prevFighters.map(f => {
          if (!f.moving) return f;

          let targetLat, targetLng;

          // לפי הפאזה (phase) של הלוחם
          if (f.phase === "exit") {
            // תזוזה במסלול קצר (200 מטר)
            if (f.route && f.positionIdx < f.route.length - 1) {
              const nextWaypoint = f.route[f.positionIdx + 1];
              targetLat = nextWaypoint[0];
              targetLng = nextWaypoint[1];

              const dLat = (targetLat - f.lat) * Math.PI / 180;
              const dLng = (targetLng - f.lng) * Math.PI / 180;
              const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
              const distanceKm = 6371 * c;

              let speedKmPerSec = 2350 / 3600; // מהירות פתיחה

              if (distanceKm < 0.02) {
                return { ...f, lat: targetLat, lng: targetLng, positionIdx: f.positionIdx + 1, phase: "chase" };
              }

              const moveRatio = speedKmPerSec / distanceKm;
              const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
              const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

              return { ...f, lat: newLat, lng: newLng };
            } else {
              // בטעות אין route ➔ עובר ישירות לרדיפה
              return { ...f, phase: "chase" };
            }
          }

          if (f.phase === "chase") {
            // רודף אחרי החייזר
            const targetAlien = aliens.find(a => a.id === f.targetAlienId);

            if (targetAlien) {
              const targetPos = targetAlien.route?.[targetAlien.positionIdx] || targetAlien.route?.[0];
              targetLat = targetPos[0];
              targetLng = targetPos[1];
            } else {
              // חייזר כבר מת ➔ חזרה לטקילה
              return { ...f, phase: "return" };
            }

            const dLat = (targetLat - f.lat) * Math.PI / 180;
            const dLng = (targetLng - f.lng) * Math.PI / 180;
            const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
            const distanceKm = 6371 * c;

            let speedKmPerSec = 200 / 3600;
            if (distanceKm < 0.1) speedKmPerSec = 20 / 3600;

            const moveRatio = speedKmPerSec / distanceKm;
            const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
            const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

            return { ...f, lat: newLat, lng: newLng };
          }

          if (f.phase === "return") {
            // חזרה לטקילה
            if (f.homeLat !== undefined && f.homeLng !== undefined) {
              targetLat = f.homeLat;
              targetLng = f.homeLng;

              const dLat = (targetLat - f.lat) * Math.PI / 180;
              const dLng = (targetLng - f.lng) * Math.PI / 180;
              const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
              const distanceKm = 6371 * c;

              if (distanceKm < 0.05) {
                // הגיע לטקילה ➔ למחוק
                return null;
              }

              let speedKmPerSec = 200 / 3600;
              const moveRatio = speedKmPerSec / distanceKm;
              const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
              const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

              return { ...f, lat: newLat, lng: newLng };
            }
          }

          return f;
        });

        // מחיקה של לוחמים שסומנו null (חזרו לטקילה)
        return updatedFighters.filter(f => f !== null);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, setFighters, aliens]);

  return null;
}
