import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

export default function InvasionSync({ landings, aliens, setLandings, setAliens, setTakilas, setFighters }) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (landings.length === 0 && aliens.length === 0) return;

      const geoJSON = {
        type: "FeatureCollection",
        features: [
          ...landings.map(l => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [l.lng, l.lat],
            },
            properties: {
              type: "landing",
              id: l.id,
              locationName: l.name,
              landingCode: l.landingCode || null
            }
          })),
          ...aliens.map(a => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                a.route[a.positionIdx][1],
                a.route[a.positionIdx][0]
              ]
            },
            properties: {
              type: "alien",
              id: a.id,
              landingId: a.landingId,
              alienCode: a.alienCode || null
            }
          }))
        ]
      };

      axios.post(`${API_BASE}/api/update-invasion`, geoJSON);
    }, 1000);

    return () => clearInterval(interval);
  }, [landings, aliens]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/invasion`);
        const features = res.data.features;

        const remoteLandings = features
          .filter(f => f.properties?.type === 'landing')
          .map(f => ({
            id: f.properties.id,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            name: f.properties.locationName || 'Unknown',
            landingCode: f.properties.landingCode || '?'
          }));

        const remoteAliens = features
          .filter(f => f.properties?.type === 'alien')
          .map(f => ({
            id: f.properties.id,
            singlePoint: [f.geometry.coordinates[1], f.geometry.coordinates[0]],
            landingId: f.properties.landingId,
            alienCode: f.properties.alienCode || null
          }));

        const remoteTakilas = features
          .filter(f => f.properties?.type === 'takila')
          .map(f => ({
            id: f.properties.id,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            lastUpdated: f.properties.lastUpdated,
            direction: f.properties.direction || Math.random() * 360
          }));

        const remoteFighters = features
          .filter(f => f.properties?.type === 'fighter')
          .map(f => ({
            id: f.properties.id,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            lastUpdated: f.properties.lastUpdated
          }));

        // 🛠️ מיזוג landings
        setLandings(prev => {
          const byId = Object.fromEntries(prev.map(l => [l.id, l]));
          remoteLandings.forEach(remote => {
            byId[remote.id] = { ...byId[remote.id], ...remote };
          });
          return Object.values(byId);
        });

        // 🛠️ מיזוג aliens בזהירות — לא למחוק route קיים
        setAliens(prev => {
          const byId = Object.fromEntries(prev.map(a => [a.id, a]));
          remoteAliens.forEach(remote => {
            if (byId[remote.id]) {
              byId[remote.id] = {
                ...byId[remote.id],
                landingId: remote.landingId,
                alienCode: remote.alienCode || byId[remote.id].alienCode,
                // לא לדרוס את ה־route הקיים!
              };
            } else {
              // חייזר חדש — יוצרים לו מסלול מינימלי
              byId[remote.id] = {
                id: remote.id,
                route: [remote.singlePoint, remote.singlePoint],
                positionIdx: 0,
                landingId: remote.landingId,
                alienCode: remote.alienCode
              };
            }
          });
          return Object.values(byId);
        });

        // 🛠️ מיזוג takilas + שמירת showFightersOut
        setTakilas(prev => {
          const byId = Object.fromEntries(prev.map(t => [t.id, t]));
          remoteTakilas.forEach(remote => {
            if (byId[remote.id]) {
              remote.showFightersOut = byId[remote.id].showFightersOut || false;
            }
            byId[remote.id] = { ...byId[remote.id], ...remote };
          });
          return Object.values(byId);
        });

        // 🛠️ מיזוג fighters
        setFighters(prev => {
          const byId = Object.fromEntries(prev.map(f => [f.id, f]));
          remoteFighters.forEach(remote => {
            byId[remote.id] = { ...byId[remote.id], ...remote };
          });
          return Object.values(byId);
        });

      } catch (err) {
        console.error("❌ Failed to load invasion data:", err.message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [setLandings, setAliens, setTakilas, setFighters]);

  return null;
}
