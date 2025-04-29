// ✅ InvasionSync.js מעודכן - כולל קליטת shots ו-explosions

import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = "https://e-38.onrender.com";

export default function InvasionSync({ landings, aliens, setLandings, setAliens, setTakilas, setFighters, setShots, setExplosions, isDeleting }) {
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
          direction: f.properties.direction || 0,
          takilaCode: f.properties.takilaCode || '',
          positionIdx: f.properties.positionIdx || 0,
          route: f.properties.route || [],
          showFightersOut: f.properties.showFightersOut || false
        }));

        const remoteFighters = features.filter(f => f.properties?.type === 'fighter').map(f => ({
          id: f.properties.id,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          lastUpdated: f.properties.lastUpdated,
          takilaCode: f.properties.takilaCode || '',
          fighterCode: f.properties.fighterCode || '',
          phase: f.properties.phase || 'exit'
        }));

        const remoteShots = features.filter(f => f.properties?.type === 'shot').map(f => ({
          from: [f.geometry.coordinates[0][1], f.geometry.coordinates[0][0]],
          to: [f.geometry.coordinates[1][1], f.geometry.coordinates[1][0]]
        }));

        const remoteExplosions = features.filter(f => f.properties?.type === 'explosion').map(f => ({
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          type: f.properties.type
        }));

        setLandings(remoteLandings);
        setAliens(remoteAliens);
        setTakilas(remoteTakilas);
        setFighters(remoteFighters);
        setShots(remoteShots);
        setExplosions(remoteExplosions);

      } catch (err) {
        console.error("❌ Failed to sync invasion:", err.message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [landings, aliens, isDeleting, setLandings, setAliens, setTakilas, setFighters, setShots, setExplosions]);

  return null;
}
