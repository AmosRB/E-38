import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import AlienManager from './components/AlienManager';
import InvasionSync from './components/InvasionSync';
import getRoute from './utils/getRoute';
import useInvasionStore from './hooks/useInvasionStore';
import axios from 'axios';

const center = [31.5, 34.8];

const getNearestTownName = async (lat, lng) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    return res.data.address.town || res.data.address.city || res.data.address.village || "Unknown";
  } catch {
    return "Unknown";
  }
};

export default function App() {
  const {
    landings,
    aliens,
    upsertLanding,
    upsertAliens,
    clearAll
  } = useInvasionStore();

  const [createMode, setCreateMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");

  const getNextAlienId = () => {
    const ids = aliens.map(a => a.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  };

  const handleMapClick = async (latlng) => {
    if (!createMode) return;
    setCreateMode(false);
    setCursorStyle("default");

    const locationName = await getNearestTownName(latlng.lat, latlng.lng);
    const landingId = Date.now();
    const landingCode = String.fromCharCode(65 + (landings.length % 26));

    const newLanding = {
      id: landingId,
      lat: latlng.lat,
      lng: latlng.lng,
      name: locationName,
      landingCode
    };
    upsertLanding(newLanding);

    const directions = [0, 45, 90, 135, 180, 225, 270, 315];
    const startId = getNextAlienId();
    const alienPromises = directions.map(async (angle, index) => {
      const rad = angle * Math.PI / 180;
      const target = [
        latlng.lat + 0.05 * Math.cos(rad),
        latlng.lng + 0.05 * Math.sin(rad)
      ];
      const route = await getRoute([latlng.lat, latlng.lng], target);
      return {
        id: startId + index,
        route: route.length > 1 ? route : [[latlng.lat, latlng.lng], [latlng.lat, latlng.lng]],
        positionIdx: 0,
        landingId,
        alienCode: `${landingCode}${index + 1}`
      };
    });

    const newAliens = await Promise.all(alienPromises);
    upsertAliens(newAliens);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const orphan = landings.find(l => !aliens.some(a => a.landingId === l.id));
      if (!orphan) return;

      const directions = [0, 45, 90, 135, 180, 225, 270, 315];
      const startId = aliens.length > 0 ? Math.max(...aliens.map(a => a.id)) + 1 : 1;

      const alienPromises = directions.map(async (angle, index) => {
        const rad = angle * Math.PI / 180;
        const to = [
          orphan.lat + 0.05 * Math.cos(rad),
          orphan.lng + 0.05 * Math.sin(rad)
        ];
        const route = await getRoute([orphan.lat, orphan.lng], to);
        return {
          id: startId + index,
          route: route.length > 1 ? route : [[orphan.lat, orphan.lng], [orphan.lat, orphan.lng]],
          positionIdx: 0,
          landingId: orphan.id,
          alienCode: `${orphan.landingCode || '?'}${index + 1}`
        };
      });

      const newAliens = await Promise.all(alienPromises);
      upsertAliens(newAliens);
    }, 3000);

    return () => clearInterval(interval);
  }, [landings, aliens, upsertAliens]);

  return (
    <div style={{ cursor: cursorStyle }}>
      <Navbar
        landingCount={landings.length}
        alienCount={aliens.length}
        onActivateCreate={() => {
          setCreateMode(true);
          setCursorStyle("crosshair");
        }}
        clearAll={clearAll}
      />

      {landings.length === 0 && aliens.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          backgroundColor: '#111',
          color: '#ff5555',
          textAlign: 'center',
          padding: '8px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          🔕 No active landings or aliens detected.
        </div>
      )}

      <AlienManager aliens={aliens} setAliens={upsertAliens} />
      <InvasionSync landings={landings} aliens={aliens} setLandings={upsertLanding} setAliens={upsertAliens} />
      <MapView
        center={center}
        landings={landings}
        aliens={aliens}
        onMapClick={handleMapClick}
      />
    </div>
  );
}
