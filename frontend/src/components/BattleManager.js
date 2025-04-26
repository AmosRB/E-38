// BattleManager.js 🔹 עדכון עם פיצוצים בחייזרים
import { useEffect } from 'react';

export default function BattleManager({ fighters, aliens, setAliens, setShots, setExplosions }) {
  useEffect(() => {
    const interval = setInterval(() => {
      const alienTargets = {}; // alienId -> array of fighterIds

      fighters.forEach(f => {
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
        .filter(([alienId, fighterIds]) => fighterIds.length >= 2)
        .map(([alienId]) => parseInt(alienId));

      if (aliensToRemove.length > 0) {
        // 🔹 פיצוץ על כל חייזר שנהרג
        const explosionsToAdd = aliensToRemove.map(alienId => {
          const deadAlien = aliens.find(a => a.id === alienId);
          if (!deadAlien) return null;
          const pos = deadAlien.route?.[deadAlien.positionIdx] || deadAlien.route?.[0];
          return { lat: pos[0], lng: pos[1], type: 'explosion' };
        }).filter(Boolean);

        setExplosions(prev => [...prev, ...explosionsToAdd]);

        setAliens(prevAliens => prevAliens.filter(a => !aliensToRemove.includes(a.id)));
        console.log(`🔫 Aliens killed with explosions: ${aliensToRemove.join(', ')}`);
      }

    }, 500);

    return () => clearInterval(interval);
  }, [fighters, aliens, setAliens, setShots, setExplosions]);

  function calculateShortTarget(fromLat, fromLng, toLat, toLng) {
    const distanceKm = 0.02; // 20 מטר
    const angle = Math.atan2(
      (toLat - fromLat) * Math.PI / 180,
      (toLng - fromLng) * Math.PI / 180
    );
    const dx = distanceKm * Math.cos(angle);
    const dy = distanceKm * Math.sin(angle);
    return [
      fromLat + dy / 111,
      fromLng + dx / (111 * Math.cos(fromLat * Math.PI / 180))
    ];
  }
}
