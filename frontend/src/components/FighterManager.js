import { useEffect } from 'react';

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
          const aVal = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(t.lat * Math.PI/180) * Math.cos(lat * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distance = 6371 * c; // Distance in km
          return distance < 1.0; // פחות מ־1 ק"מ
        });

        if (nearbyAliens.length > 0) {
          const newFighters = Array.from({ length: 4 }).map((_, idx) => ({
            id: Date.now() + idx,
            lat: t.lat + (Math.random() - 0.5) * 0.002,
            lng: t.lng + (Math.random() - 0.5) * 0.002,
            lastUpdated: Date.now()
          }));

          setFighters(prev => [...prev, ...newFighters]);

          return { ...t, hasDispatchedFighters: true };
        }

        return t;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [takilas, aliens, fighters, setFighters, setTakilas]);

  return null;
}