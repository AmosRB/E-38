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
  route: f.properties.route || [[f.geometry.coordinates[1], f.geometry.coordinates[0]], [f.geometry.coordinates[1], f.geometry.coordinates[0]]],
  positionIdx: f.properties.positionIdx || 0,
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

        // 🛠️ מיזוג aliens - לא מוחקים חייזרים קיימים שלא הופיעו בשרת
        setAliens(prev => {
          const prevIds = new Set(prev.map(a => a.id));
          const remoteIds = new Set(remoteAliens.map(a => a.id));

          const updatedAliens = prev.map(a => {
            const remote = remoteAliens.find(r => r.id === a.id);
            if (remote) {
              return {
                ...a,
                landingId: remote.landingId,
                alienCode: remote.alienCode || a.alienCode,
              };
            }
            return a;
          });

          const newAliens = remoteAliens.filter(r => !prevIds.has(r.id)).map(r => ({
            id: r.id,
            route: [r.singlePoint, r.singlePoint],
            positionIdx: 0,
            landingId: r.landingId,
            alienCode: r.alienCode
          }));

          return [...updatedAliens, ...newAliens];
        });

        // 🛠️ מיזוג fighters - לא מוחקים לוחמים קיימים שלא הופיעו בשרת
        setFighters(prev => {
          const prevIds = new Set(prev.map(f => f.id));
          const remoteIds = new Set(remoteFighters.map(f => f.id));

          const updatedFighters = prev.map(f => {
            const remote = remoteFighters.find(r => r.id === f.id);
            if (remote) {
              return {
                ...f,
                lat: remote.lat,
                lng: remote.lng,
                lastUpdated: remote.lastUpdated || f.lastUpdated,
                takilaCode: remote.takilaCode || f.takilaCode,
                fighterCode: remote.fighterCode || f.fighterCode
              };
            }
            return f;
          });

          const newFighters = remoteFighters.filter(r => !prevIds.has(r.id)).map(r => ({
            id: r.id,
            lat: r.lat,
            lng: r.lng,
            lastUpdated: r.lastUpdated,
            takilaCode: r.takilaCode,
            fighterCode: r.fighterCode
          }));

          return [...updatedFighters, ...newFighters];
        });

        setTakilas(remoteTakilas);

      } catch (err) {
        console.error("❌ Failed to sync invasion:", err.message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [landings, aliens, isDeleting, setLandings, setAliens, setTakilas, setFighters]);

  return null;
}
