import { useEffect } from 'react';

export default function BattleManager({ fighters, aliens, setAliens, setExplosions }) {
  useEffect(() => {
    const interval = setInterval(() => {
      const alienTargets = {}; // alienId -> [fighterIds]

      fighters.forEach(f => {
        aliens.forEach(a => {
          if (!a.route || a.route.length === 0) return;
          const [lat, lng] = a.route[a.positionIdx] || a.route[0];

          const dLat = (lat - f.lat) * Math.PI / 180;
          const dLng = (lng - f.lng) * Math.PI / 180;
          const aVal = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(f.lat * Math.PI/180) * Math.cos(lat * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distance = 6371 * c;

          if (distance < 0.02) { // פחות מ־20 מטר
            if (!alienTargets[a.id]) alienTargets[a.id] = [];
            alienTargets[a.id].push(f.id);
          }
        });
      });

      const aliensToRemove = Object.entries(alienTargets)
        .filter(([alienId, fighterIds]) => fighterIds.length >= 2)
        .map(([alienId]) => parseInt(alienId));

      if (aliensToRemove.length > 0) {
        setAliens(prev => prev.filter(a => {
          if (aliensToRemove.includes(a.id)) {
            const [lat, lng] = a.route[a.positionIdx] || a.route[0];
            setExplosions(prev => [...prev, { lat, lng, type: 'explosion' }]);
            return false;
          }
          return true;
        }));
        console.log(`☠️ Aliens killed: ${aliensToRemove.join(', ')}`);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, aliens, setAliens, setExplosions]);

  return null;
}
