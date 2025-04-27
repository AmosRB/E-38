import { useEffect } from 'react';

// ✅ פונקציה ליצירת מסלול פתיחה (200 מטר לכל כיוון)
function createFighterRoute(takila, mode) {
  const startLat = takila.lat;
  const startLng = takila.lng;

  let angle = 0;
  switch (mode) {
    case 'right':
      angle = Math.PI / 2;
      break;
    case 'left':
      angle = -Math.PI / 2;
      break;
    case 'back':
      angle = Math.PI;
      break;
    case 'forward':
    default:
      angle = 0;
      break;
  }

  const movePoint = (lat, lng, angle, distanceKm) => {
    const dx = distanceKm * Math.cos(angle);
    const dy = distanceKm * Math.sin(angle);
    return [
      lat + dy / 111,
      lng + dx / (111 * Math.cos(lat * Math.PI / 180))
    ];
  };

  const firstMoveKm = 0.2; // תנועה ראשונה 200 מטר
  const waypoint = movePoint(startLat, startLng, angle, firstMoveKm);

  return [
    [startLat, startLng],
    waypoint
  ];
}

// ✅ פונקציה ליצירת לוחם חדש
function createFighter(takila, alien, mode) {
  return {
    id: Date.now() + Math.random(),
    lat: takila.lat,
    lng: takila.lng,
    route: createFighterRoute(takila, mode),
    positionIdx: 0,
    targetAlienId: alien.id,
    moving: true,
    lastUpdated: Date.now(),
    homeLat: takila.lat,
    homeLng: takila.lng,
    takilaCode: takila.takilaCode, // מזהה טקילה
    phase: "exit" // שלב יציאה
  };
}

// ✅ קומפוננטת ניהול לוחמים
export default function FighterManager({ takilas, aliens, fighters, setFighters, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setTakilas(prevTakilas => prevTakilas.map(t => {
        if (t.hasDispatchedFighters) return t;

        const nearbyAliens = aliens.filter(a => {
          if (!a.route || a.route.length === 0) return false;
          const [lat, lng] = a.route[a.positionIdx] || a.route[0];

          const dLat = (lat - t.lat) * Math.PI / 180;
          const dLng = (lng - t.lng) * Math.PI / 180;
          const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(t.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distance = 6371 * c;

          return distance < 3.0; // טווח 3 ק"מ
        });

        if (nearbyAliens.length > 0) {
          const targetAlien = nearbyAliens[0];

          // יצירת ארבעה לוחמים עם 2 שניות הפרש
          const modes = ['forward', 'right', 'left', 'back'];
          modes.forEach((mode, idx) => {
            setTimeout(() => {
              setFighters(prev => [...prev, createFighter(t, targetAlien, mode)]);
            }, idx * 2000); // הפרש של 2 שניות בין כל לוחם
          });

          return { ...t, hasDispatchedFighters: true, showFightersOut: true };
        }

        return t;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [takilas, aliens, fighters, setFighters, setTakilas]);

  return null;
}
