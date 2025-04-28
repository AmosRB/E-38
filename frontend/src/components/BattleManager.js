import { useEffect } from 'react';

export default function BattleManager({ fighters, aliens, setAliens, setFighters, setShots, setExplosions }) {
  useEffect(() => {
    const interval = setInterval(() => {
      const alienTargets = {}; // { alienId: [fighterIds] }

      fighters.forEach(f => {
        if (!f.moving || f.phase !== "chase") return; // רק לוחמים שרודפים

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
          // ירייה לחייזר
          setShots(prev => [...prev, {
            from: [f.lat, f.lng],
            to: [targetLat, targetLng],
            timestamp: Date.now()
          }]);

          if (!alienTargets[targetAlien.id]) alienTargets[targetAlien.id] = [];
          alienTargets[targetAlien.id].push(f.id);
        }
      });

      // מציאת חייזרים שנהרגו
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

        // מוחקים את החייזרים המתים
        setAliens(prevAliens => prevAliens.filter(a => !aliensToRemove.includes(a.id)));

        console.log(`🔫 Aliens killed with explosions: ${aliensToRemove.join(', ')}`);

        // ➡️ מעבירים את כל הלוחמים שהיו עם targetAlienId לחזרה
        setFighters(prevFighters => prevFighters.map(f => {
          if (aliensToRemove.includes(f.targetAlienId)) {
            return { ...f, targetAlienId: null, phase: "return" };
          }
          return f;
        }));
      }

    }, 500); // כל חצי שניה

    return () => clearInterval(interval);
  }, [fighters, aliens, setAliens, setFighters, setShots, setExplosions]);

  return null;
}
