import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

export default function InvasionSync({ landings, aliens, setLandings, setAliens, setTakilas, setFighters, isDeleting }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isDeleting) return;

      try {
        const res = await axios.get(`${API_BASE}/api/invasion`);
        const features = res.data.features || [];

        const remoteLandings = features.filter(f => f.properties?.type === 'landing').map(f => ({
          id: f.properties.id,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          name: f.properties.locationName || 'Unknown',
          landingCode: f.properties.landingCode || '?'
        }));

        const remoteAliens = features.filter(f => f.properties?.type === 'alien').map(f => ({
          id: f.properties.id,
          singlePoint: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
          landingId: f.properties.landingId,
          alienCode: f.properties.alienCode || '?'
        }));

        const remoteTakilas = features.filter(f => f.properties?.type === 'takila').map(f => ({
          id: f.properties.id,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          lastUpdated: f.properties.lastUpdated,
          direction: f.properties.direction || Math.random() * 360,
          takilaCode: f.properties.takilaCode || '',
          showFightersOut: f.properties.showFightersOut || false
        }));

        const remoteFighters = features.filter(f => f.properties?.type === 'fighter').map(f => ({
          id: f.properties.id,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          lastUpdated: f.properties.lastUpdated,
          takilaCode: f.properties.takilaCode || '',
          fighterCode: f.properties.fighterCode || ''
        }));

        // 🛠️ מיזוג landings
        setLandings(prev => {
          const byId = Object.fromEntries(prev.map(l => [l.id, l]));
          remoteLandings.forEach(remote => {
            byId[remote.id] = { ...byId[remote.id], ...remote };
          });
          return Object.values(byId);
        });

        // 🛠️ מיזוג aliens בזהירות - אל להחזיר חייזרים שנמחקו
        setAliens(prev => {
          const prevIds = new Set(prev.map(a => a.id));
          const remoteIds = new Set(remoteAliens.map(a => a.id));

          // רק חייזרים שמופיעים ברימוט או קיימים
          const merged = prev.filter(a => remoteIds.has(a.id)).map(a => {
            const remote = remoteAliens.find(r => r.id === a.id);
            return remote ? {
              ...a,
              landingId: remote.landingId,
              alienCode: remote.alienCode || a.alienCode,
              route: a.route // נשמרת
            } : a;
          });

          // חייזרים חדשים
          const newAliens = remoteAliens.filter(r => !prevIds.has(r.id)).map(r => ({
            id: r.id,
            route: [r.singlePoint, r.singlePoint],
            positionIdx: 0,
            landingId: r.landingId,
            alienCode: r.alienCode
          }));

          return [...merged, ...newAliens];
        });

        setTakilas(remoteTakilas);
        setFighters(remoteFighters);

      } catch (err) {
        console.error("❌ Failed to sync invasion:", err.message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [landings, aliens, isDeleting, setLandings, setAliens, setTakilas, setFighters]);

  return null;
}
