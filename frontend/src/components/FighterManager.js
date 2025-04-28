import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

function createFighter(takila, targetAlien, mode) {
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

  const waypoint = movePoint(startLat, startLng, angle, 0.2);

  return {
    id: Date.now() + Math.random(),
    lat: startLat,
    lng: startLng,
    route: [[startLat, startLng], waypoint],
    positionIdx: 0,
    targetAlienId: targetAlien.id,
    moving: true,
    lastUpdated: Date.now(),
    homeLat: startLat,
    homeLng: startLng,
    takilaCode: takila.takilaCode,
    phase: "exit",
    speed: 1800 + Math.random() * 3000
  };
}

export default function FighterManager({ takilas, aliens, fighters, setFighters, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      let createdFighters = false;
      let newFighters = [];

      const updatedTakilas = takilas.map(t => {
        if (t.hasDispatchedFighters) return t;

        const nearbyAliens = aliens.filter(a => {
          if (!a.route || a.route.length === 0) return false;
          const [lat, lng] = a.route[a.positionIdx] || a.route[0];

          const dLat = (lat - t.lat) * Math.PI / 180;
          const dLng = (lng - t.lng) * Math.PI / 180;
          const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(t.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distance = 6371 * c;

          return distance < 3.0;
        });

        if (nearbyAliens.length > 0) {
          const targetAlien = nearbyAliens[0];
          const modes = ['forward', 'right', 'left', 'back'];
          const created = modes.map(mode => createFighter(t, targetAlien, mode));
          newFighters = [...newFighters, ...created];
          createdFighters = true;
          return { ...t, hasDispatchedFighters: true, showFightersOut: true };
        }

        return t;
      });

      if (createdFighters) {
        setFighters(prev => [...prev, ...newFighters]);
        setTakilas(updatedTakilas);

        // ✅ שליחת עדכון לשרת אחרי יצירת לוחמים
        const features = [
          ...updatedTakilas.map(t => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [t.lng, t.lat] },
            properties: {
              type: "takila",
              id: t.id,
              lastUpdated: t.lastUpdated,
              direction: t.direction,
              takilaCode: t.takilaCode,
              showFightersOut: t.showFightersOut
            }
          })),
          ...newFighters.map(f => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [f.lng, f.lat] },
            properties: {
              type: "fighter",
              id: f.id,
              lastUpdated: f.lastUpdated,
              takilaCode: f.takilaCode,
              fighterCode: f.fighterCode
            }
          }))
        ];

        try {
          await axios.post(`${API_BASE}/api/update-invasion`, { type: "FeatureCollection", features });
          console.log('📡 Server updated after creating fighters');
        } catch (err) {
          console.error('❌ Failed to update server after creating fighters:', err.message);
        }
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [takilas, aliens, setFighters, setTakilas]);

  return null;
}
