import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

export default function FighterManager({ takilas, aliens, fighters, setFighters, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      let takilasToDispatch = [];

      for (const t of takilas) {
        if (t.hasDispatchedFighters) continue;

        const nearbyAliens = aliens.filter(a => {
          if (!a.route || a.route.length === 0) return false;
          const [lat, lng] = a.route[a.positionIdx] || a.route[0];

          const dLat = (lat - t.lat) * Math.PI / 180;
          const dLng = (lng - t.lng) * Math.PI / 180;
          const aVal = Math.sin(dLat / 2) ** 2 +
            Math.cos(t.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
          const distanceKm = 6371 * c;

          return distanceKm < 3.0;
        });

        if (nearbyAliens.length > 0) {
          takilasToDispatch.push({ takilaId: t.id, targetAlienId: nearbyAliens[0].id });
        }
      }

      // שלח לשרת ליצירת לוחמים
      for (const { takilaId, targetAlienId } of takilasToDispatch) {
        try {
          await axios.post(`${API_BASE}/api/create-fighters`, { takilaId, targetAlienId });
          console.log(`🧍 Fighters created for takila ${takilaId}`);
        } catch (err) {
          console.error('❌ Failed to create fighters:', err.message);
        }
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [takilas, aliens]);

  return null;
}
