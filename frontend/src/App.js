// ✅ App.js מתוקן עם תמיכה במחיקת הכל (CLEAR ALL)

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import InvasionSync from './components/InvasionSync';
import BottomBar from './components/BottomBar';
import axios from 'axios';
import FighterManager from './components/FighterManager';
import BattleManager from './components/BattleManager';
import DefenseManager from './components/DefenseManager';
import ExplosionManager from './components/ExplosionManager';
import FighterMovementManager from './components/FighterMovementManager';
import ConfirmDialog from './components/ConfirmDialog';
import ShotManager from './components/ShotManager';

const center = [31.5, 34.8];

const getNearestTownName = async (lat, lng) => {
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
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
  const [shots, setShots] = useState([]);
  const [createMode, setCreateMode] = useState(false);
  const [createTakilaMode, setCreateTakilaMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");
  const [explosions, setExplosions] = useState([]);
  const [showConfirmDeleteTakilas, setShowConfirmDeleteTakilas] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const handleMapClick = async (latlng) => {
    if (createTakilaMode) {
      setCreateTakilaMode(false);
      setCursorStyle("default");
      try {
        await axios.post('https://e-38.onrender.com/api/create-takila', { lat: latlng.lat, lng: latlng.lng });
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

    const landingFeature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [latlng.lng, latlng.lat] },
      properties: { type: "landing", id: landingId, locationName }
    };

    try {
      await axios.post('https://e-38.onrender.com/api/update-invasion', {
        type: "FeatureCollection",
        features: [landingFeature]
      });
      console.log('📡 Landing created on server');
    } catch (err) {
      console.error('❌ Failed to create landing:', err.message);
    }
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

  const handleConfirmDeleteAll = async () => {
    setShowConfirmDeleteAll(false);
    try {
      await fetch('https://e-38.onrender.com/api/clear-all', { method: 'DELETE' });
      setLandings([]);
      setAliens([]);
      setTakilas([]);
      setFighters([]);
      setShots([]);
      setExplosions([]);
      console.log('🧹 Cleared all data');
    } catch (err) {
      console.error('❌ Failed to clear all:', err.message);
    }
  };

  return (
    <div style={{ cursor: cursorStyle }}>
      <Navbar
        landingCount={landings.length}
        alienCount={aliens.length}
        onActivateCreate={() => { setCreateMode(true); setCursorStyle("crosshair"); }}
        onRequestClearAll={() => { setShowConfirmDeleteAll(true); }}
      />

      <InvasionSync
        landings={landings}
        aliens={aliens}
        setLandings={setLandings}
        setAliens={setAliens}
        setTakilas={setTakilas}
        setFighters={setFighters}
        setShots={setShots}
        setExplosions={setExplosions}
      />

      <BattleManager
        fighters={fighters}
        aliens={aliens}
        landings={landings}
        setAliens={setAliens}
        setFighters={setFighters}
        setShots={setShots}
        setExplosions={setExplosions}
      />

      <FighterManager takilas={takilas} aliens={aliens} />
      <DefenseManager fighters={fighters} aliens={aliens} setFighters={setFighters} setExplosions={setExplosions} />
      <ExplosionManager explosions={explosions} setExplosions={setExplosions} />
      <FighterMovementManager fighters={fighters} setFighters={setFighters} aliens={aliens} setTakilas={setTakilas} />

      <ShotManager fighters={fighters} aliens={aliens} setAliens={setAliens} setExplosions={setExplosions} setFighters={setFighters}>
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

      <BottomBar onJump={handleJump} onCallback={handleCallback} fighters={fighters} takilas={takilas} />

      {showConfirmDeleteTakilas && (
        <ConfirmDialog
          message="האם אתה בטוח שברצונך למחוק את כל הטקילות?"
          onConfirm={handleConfirmDeleteTakilas}
          onCancel={() => setShowConfirmDeleteTakilas(false)}
        />
      )}

      {showConfirmDeleteAll && (
        <ConfirmDialog
          message="האם אתה בטוח שברצונך למחוק את כל הנחיתות, החייזרים והטקילות?"
          onConfirm={handleConfirmDeleteAll}
          onCancel={() => setShowConfirmDeleteAll(false)}
        />
      )}

    </div>
  );
}
