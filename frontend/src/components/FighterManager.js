// ✅ FighterManager.js חדש - יוצר לוחמים בלבד, בלי תנועה לוקלית

import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

export default function FighterManager({ takilas, aliens }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const t of takilas) {
        if (t.showFightersOut) continue;

        const near = aliens.find(a => {
          const point = a.route[a.positionIdx] || a.route[0];
          const d = Math.sqrt((point[0] - t.lat) ** 2 + (point[1] - t.lng) ** 2) * 111;
          return d < 3;
        });

        if (near) {
          try {
            await axios.post(`${API_BASE}/api/create-fighters`, {
              takilaId: t.id,
              targetAlienId: near.id
            });
            console.log(`🧍 Fighters created for takila ${t.id}`);
          } catch (err) {
            console.error('❌ Failed to create fighters:', err.message);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [takilas, aliens]);

  return null;
}
