import { useEffect } from 'react';

export default function FighterMovementManager({ fighters, setFighters, aliens }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setFighters(prevFighters => {
        return prevFighters.map(f => {
          if (!f.moving) return f;

          const targetAlien = aliens.find(a => a.id === f.targetAlienId);
          if (!targetAlien) return f;

          const targetPos = targetAlien.route?.[targetAlien.positionIdx] || targetAlien.route?.[0];
          const [targetLat, targetLng] = targetPos;

          const dLat = (targetLat - f.lat) * Math.PI / 180;
          const dLng = (targetLng - f.lng) * Math.PI / 180;
          const aVal = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distanceKm = 6371 * c;

          const speedKmPerSec = 35 / 3600; // 7 קמ"ש

          if (f.route && f.positionIdx < f.route.length - 1) {
            const nextWaypoint = f.route[f.positionIdx + 1];
            const waypointLat = nextWaypoint[0];
            const waypointLng = nextWaypoint[1];

            const dLatWp = (waypointLat - f.lat) * Math.PI / 180;
            const dLngWp = (waypointLng - f.lng) * Math.PI / 180;
            const aWp = Math.sin(dLatWp / 2) * Math.sin(dLatWp / 2) + Math.cos(f.lat * Math.PI / 180) * Math.cos(waypointLat * Math.PI / 180) * Math.sin(dLngWp / 2) * Math.sin(dLngWp / 2);
            const cWp = 2 * Math.atan2(Math.sqrt(aWp), Math.sqrt(1 - aWp));
            const distanceToWaypoint = 6371 * cWp;

            if (distanceToWaypoint < 0.02) { // קטן מ-2 מטר
              return {
                ...f,
                lat: waypointLat,
                lng: waypointLng,
                positionIdx: f.positionIdx + 1
              };
            }

            const moveRatio = speedKmPerSec / distanceToWaypoint;

            const newLat = f.lat + (waypointLat - f.lat) * Math.min(moveRatio, 1);
            const newLng = f.lng + (waypointLng - f.lng) * Math.min(moveRatio, 1);

            return { ...f, lat: newLat, lng: newLng };
          }

          // אחרי שסיימו את ה־route ➔ רודפים אחרי החייזר
          const moveRatio = speedKmPerSec / distanceKm;

          const newLat = f.lat + (targetLat - f.lat) * Math.min(moveRatio, 1);
          const newLng = f.lng + (targetLng - f.lng) * Math.min(moveRatio, 1);

          return { ...f, lat: newLat, lng: newLng };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, setFighters, aliens]);

  return null;
}
