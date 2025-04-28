import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

export default function FighterManager({ takilas, aliens, fighters, setFighters, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const updatedFighters = [...fighters];
      let createdNewFighters = false;

      const updatedTakilas = takilas.map(t => {
        if (t.showFightersOut && t.lastUpdated && now - t.lastUpdated > 5000 && !fighters.some(f => f.takilaCode === t.takilaCode)) {
          // טקילה מוכנה להוציא לוחמים ואין לה לוחמים פעילים
          for (let i = 0; i < 4; i++) {
            updatedFighters.push({
              id: `${t.id}_${i}_${now}`,
              lat: t.lat + (Math.random() - 0.5) * 0.001,
              lng: t.lng + (Math.random() - 0.5) * 0.001,
              lastUpdated: now,
              takilaCode: t.takilaCode,
              fighterCode: `F${i + 1}`
            });
          }
          createdNewFighters = true;
          return { ...t, lastUpdated: now };
        }
        return t;
      });

      if (createdNewFighters) {
        setFighters(updatedFighters);
        setTakilas(updatedTakilas);

        // 🛰️ שליחת עדכון לשרת עם הלוחמים החדשים
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
          ...updatedFighters.map(f => ({
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
  }, [takilas, fighters, setFighters, setTakilas]);

  return null;
}
