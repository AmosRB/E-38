import { useEffect } from 'react';

export default function BattleManager({ fighters, aliens, setAliens }) {
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

        if (distanceKm < 0.5) { // טווח ירי
          if (!alienTargets[targetAlien.id]) alienTargets[targetAlien.id] = [];
          alienTargets[targetAlien.id].push(f.id);
        }
      });

      // ✅ סינון חייזרים שנהרגו
      const aliensToRemove = Object.entries(alienTargets)
        .filter(([alienId, fighterIds]) => fighterIds.length >= 2) // לפחות שני לוחמים יורים עליו
        .map(([alienId]) => parseInt(alienId));

      if (aliensToRemove.length > 0) {
        setAliens(prevAliens => prevAliens.filter(a => !aliensToRemove.includes(a.id)));
        console.log(`☕️ Aliens killed: ${aliensToRemove.join(', ')}`);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, aliens, setAliens]);

  return null;
}
