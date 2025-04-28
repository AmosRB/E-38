import { useEffect } from 'react';
import axios from 'axios';

export default function BattleManager({ fighters, aliens, setAliens, setFighters, setShots, setExplosions, landings }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const alienTargets = {}; // { alienId: [fighterIds] }

      fighters.forEach(f => {
        if (!f.moving || f.phase !== "chase") return;

        const targetAlien = aliens.find(a => a.id === f.targetAlienId);
        if (!targetAlien) return;

        const targetPos = targetAlien.route?.[targetAlien.positionIdx] || targetAlien.route?.[0];
        const [targetLat, targetLng] = targetPos;

        const dLat = (targetLat - f.lat) * Math.PI / 180;
        const dLng = (targetLng - f.lng) * Math.PI / 180;
        const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(f.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
        const distanceKm = 6371 * c;

        if (distanceKm < 0.5) {
          setShots(prev => [...prev, {
            from: [f.lat, f.lng],
            to: [targetLat, targetLng],
            timestamp: Date.now()
          }]);

          if (!alienTargets[targetAlien.id]) alienTargets[targetAlien.id] = [];
          alienTargets[targetAlien.id].push(f.id);
        }
      });

      const aliensToRemove = Object.entries(alienTargets)
        .filter(([_, fighterIds]) => fighterIds.length >= 2)
        .map(([alienId]) => parseInt(alienId));

      if (aliensToRemove.length > 0) {
        const explosionsToAdd = aliensToRemove.map(alienId => {
          const deadAlien = aliens.find(a => a.id === alienId);
          if (!deadAlien) return null;
          const pos = deadAlien.route?.[deadAlien.positionIdx] || deadAlien.route?.[0];
          return { lat: pos[0], lng: pos[1], type: 'explosion' };
        }).filter(Boolean);

        setExplosions(prev => [...prev, ...explosionsToAdd]);

        // מחיקת חייזרים מהסטייט
        setAliens(prevAliens => {
          const updatedAliens = prevAliens.filter(a => !aliensToRemove.includes(a.id));

          // 🛰️ שולחים עדכון לשרת לאחר מחיקה
          const updatedFeatures = [
            ...landings.map(l => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [l.lng, l.lat] },
              properties: { type: "landing", id: l.id, locationName: l.name, landingCode: l.landingCode || '?' }
            })),
            ...updatedAliens.map(a => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [a.route[a.positionIdx][1], a.route[a.positionIdx][0]] },
              properties: { type: "alien", id: a.id, landingId: a.landingId, alienCode: a.alienCode || '?' }
            }))
          ];

          axios.post('https://e-38.onrender.com/api/update-invasion', { type: "FeatureCollection", features: updatedFeatures })
            .then(() => console.log("📡 Server updated after alien kill"))
            .catch(err => console.error("❌ Failed to update server after alien kill:", err.message));

          return updatedAliens;
        });

        // מעבירים לוחמים שפגעו ל"return"
        setFighters(prevFighters => prevFighters.map(f => {
          if (aliensToRemove.includes(f.targetAlienId)) {
            return { ...f, targetAlienId: null, phase: "return" };
          }
          return f;
        }));

        console.log(`🔫 Aliens killed with explosions: ${aliensToRemove.join(', ')}`);
      }

    }, 500);

    return () => clearInterval(interval);
  }, [fighters, aliens, setAliens, setFighters, setShots, setExplosions, landings]);

  return null;
}
