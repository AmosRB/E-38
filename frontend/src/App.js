import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import AlienManager from './components/AlienManager';
import InvasionSync from './components/InvasionSync';
import BottomBar from './components/BottomBar';
import TakilaManager from './components/TakilaManager';
import getRoute from './utils/getRoute';
import axios from 'axios';
import FighterManager from './components/FighterManager';
import BattleManager from './components/BattleManager';
import DefenseManager from './components/DefenseManager';
import ExplosionManager from './components/ExplosionManager';
import FighterMovementManager from './components/FighterMovementManager';
import ConfirmDialog from './components/ConfirmDialog'; // ✅ חלון אישור מותאם
import ShotManager from './components/ShotManager';

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
  const [landings, setLandings] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [takilas, setTakilas] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [createMode, setCreateMode] = useState(false);
  const [createTakilaMode, setCreateTakilaMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");
  const [explosions, setExplosions] = useState([]);
  const [showConfirmDeleteTakilas, setShowConfirmDeleteTakilas] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const getNextAlienId = () => {
    const ids = aliens.map(a => a.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  };

  const handleMapClick = async (latlng) => {
    if (createTakilaMode) {
      setCreateTakilaMode(false);
      setCursorStyle("default");
      try {
        await axios.post('https://e-38.onrender.com/api/create-takila', {
          lat: latlng.lat,
          lng: latlng.lng
        });
        console.log('🚙 Takila created at', latlng.lat, latlng.lng);
      } catch (err) {
        console.error('❌ Failed to create takila:', err.message);
      }
      return;
    }

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
    setLandings(prev => [...prev, newLanding]);

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
    setAliens(prev => [...prev, ...newAliens]);
  };

  const handleJump = () => {
    setCreateTakilaMode(true);
    setCursorStyle("url('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Parachute.svg/32px-Parachute.svg.png') 16 16, crosshair");
  };

  const handleCallback = () => {
    setShowConfirmDeleteTakilas(true);
  };

  const handleConfirmDeleteTakilas = async () => {
    setShowConfirmDeleteTakilas(false);
    try {
      await fetch('https://e-38.onrender.com/api/takilas', { method: 'DELETE' });
      setTakilas([]);
      setFighters([]);
      console.log('🧹 Deleted takilas and fighters locally and remotely.');
    } catch (err) {
      console.error('❌ Failed to delete takilas:', err.message);
    }
  };

  const handleCancelDeleteTakilas = () => {
    setShowConfirmDeleteTakilas(false);
  };

  return (
<div style={{ cursor: cursorStyle }}>
  <Navbar
    landingCount={landings.length}
    alienCount={aliens.length}
    onActivateCreate={() => {
      setCreateMode(true);
      setCursorStyle("crosshair");
    }}
    onRequestClearAll={() => {
      setShowConfirmDeleteAll(true);
    }}
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

      <AlienManager aliens={aliens} setAliens={setAliens} />
      <TakilaManager takilas={takilas} setTakilas={setTakilas} />
      <InvasionSync
        landings={landings}
        aliens={aliens}
        setLandings={setLandings}
        setAliens={setAliens}
        setTakilas={setTakilas}
        setFighters={setFighters}
      />
      <FighterManager
        takilas={takilas}
        aliens={aliens}
        fighters={fighters}
        setFighters={setFighters}
        setTakilas={setTakilas}
      />
      <DefenseManager
        fighters={fighters}
        aliens={aliens}
        setFighters={setFighters}
        setExplosions={setExplosions}
      />
      <ExplosionManager
        explosions={explosions}
        setExplosions={setExplosions}
      />
      <FighterMovementManager
        fighters={fighters}
        setFighters={setFighters}
        aliens={aliens}
        setTakilas={setTakilas}
      />
      <ShotManager
        fighters={fighters}
        aliens={aliens}
        setAliens={setAliens}
        setExplosions={setExplosions}
        setFighters={setFighters}
      >
        {(shots) => (
          <MapView
            center={center}
            landings={landings}
            aliens={aliens}
            takilas={takilas}
            fighters={fighters}
            explosions={explosions}
            shots={shots}
            onMapClick={handleMapClick}
          />
        )}
      </ShotManager>

      <BottomBar
        onJump={handleJump}
        onCallback={handleCallback}
        fighters={fighters}
        takilas={takilas}
      />

      {showConfirmDeleteTakilas && (
        <ConfirmDialog
          message="האם אתה בטוח שברצונך למחוק את כל הטקילות?"
          onConfirm={handleConfirmDeleteTakilas}
          onCancel={handleCancelDeleteTakilas}
        />
      )}

{showConfirmDeleteAll && (
  <ConfirmDialog
    message="האם אתה בטוח שברצונך למחוק את כל הנחיתות והחייזרים?"
    onConfirm={async () => {
      try {
        await fetch('https://e-38.onrender.com/api/invasion', { method: 'DELETE' });
        console.log('🧹 Deleted invasion data from server.');
        setLandings([]);
        setAliens([]);
        setTakilas([]);
        setFighters([]);
      } catch (err) {
        console.error('❌ Failed to delete invasion data:', err.message);
      }
      setShowConfirmDeleteAll(false);
    }}
    onCancel={() => setShowConfirmDeleteAll(false)}
  />
)}

    </div>
  );
}
