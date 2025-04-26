import { useEffect } from 'react';

export default function DefenseManager({ fighters, aliens, setFighters, setExplosions }) {
  useEffect(() => {
    const interval = setInterval(() => {
      const fighterTargets = {}; // fighterId -> [alienIds]

      aliens.forEach(a => {
        fighters.forEach(f => {
          if (!a.route || a.route.length === 0) return;
          const [lat, lng] = a.route[a.positionIdx] || a.route[0];

          const dLat = (lat - f.lat) * Math.PI / 180;
          const dLng = (lng - f.lng) * Math.PI / 180;
          const aVal = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(f.lat * Math.PI/180) * Math.cos(lat * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distance = 6371 * c;

          if (distance < 0.02) { // פחות מ־20 מטר
            if (!fighterTargets[f.id]) fighterTargets[f.id] = [];
            fighterTargets[f.id].push(a.id);
          }
        });
      });

      const fightersToRemove = Object.entries(fighterTargets)
        .filter(([fighterId, alienIds]) => alienIds.length >= 2)
        .map(([fighterId]) => parseInt(fighterId));

      if (fightersToRemove.length > 0) {
        setFighters(prev => prev.filter(f => {
          if (fightersToRemove.includes(f.id)) {
            setExplosions(prev => [...prev, { lat: f.lat, lng: f.lng, type: 'fallen' }]);
            return false;
          }
          return true;
        }));
        console.log(`💀 Fighters killed: ${fightersToRemove.join(', ')}`);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, aliens, setFighters, setExplosions]);

  return null;
}
