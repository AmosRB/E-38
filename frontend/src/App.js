import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import MapView from './components/MapView';
import InvasionSync from './components/InvasionSync';
import AlienManager from './components/AlienManager';
import TakilaManager from './components/TakilaManager';
import FighterManager from './components/FighterManager';
import ShotManager from './components/ShotManager';
import ExplosionManager from './components/ExplosionManager';
import DefenseManager from './components/DefenseManager';
import FighterMovementManager from './components/FighterMovementManager';
import BattleManager from './components/BattleManager';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
  const [landings, setLandings] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [takilas, setTakilas] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [shots, setShots] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [createMode, setCreateMode] = useState(false);
  const [createTakilaMode, setCreateTakilaMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [showConfirmDeleteTakilas, setShowConfirmDeleteTakilas] = useState(false);

  const handleMapClick = async (latlng) => {
    if (createTakilaMode) {
      setCreateTakilaMode(false);
      setCursorStyle("default");
      await axios.post('/api/create-takila', { lat: latlng.lat, lng: latlng.lng });
      return;
    }

    if (!createMode) return;
    setCreateMode(false);
    setCursorStyle("default");

    const landingId = Date.now();
    const landingFeature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [latlng.lng, latlng.lat] },
      properties: { type: "landing", id: landingId }
    };

    await axios.post('/api/update-invasion', {
      type: "FeatureCollection",
      features: [landingFeature]
    });

    for (let index = 0; index < 8; index++) {
      const alienCode = String.fromCharCode(65 + (landings.length % 26)) + (index + 1);
      await axios.post('/api/create-alien', {
        lat: latlng.lat,
        lng: latlng.lng,
        landingId,
        alienCode
      });
    }
  };

  const handleJump = () => {
    setCreateTakilaMode(true);
    setCursorStyle("url('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Parachute.svg/32px-Parachute.svg.png') 16 16, crosshair");
  };

  const handleClearLandingsAliens = async () => {
    setShowConfirmDeleteAll(false);
    try {
      await axios.delete('/api/clear-landings-aliens');
      setLandings([]);
      setAliens([]);
      console.log('🧹 Cleared landings and aliens');
    } catch (err) {
      console.error('❌ Failed to clear landings and aliens:', err.message);
    }
  };

  const handleClearTakilasFighters = async () => {
    setShowConfirmDeleteTakilas(false);
    try {
      await axios.delete('/api/clear-takilas-fighters');
      setTakilas([]);
      setFighters([]);
      console.log('🧹 Cleared takilas and fighters');
    } catch (err) {
      console.error('❌ Failed to clear takilas and fighters:', err.message);
    }
  };

  return (
    <div className="app-layout" style={{ cursor: cursorStyle }}>
      <div className="map-container">
        <ShotManager
          fighters={fighters}
          aliens={aliens}
          setAliens={setAliens}
          setExplosions={setExplosions}
          setFighters={setFighters}
        >
          {(shots) => (
            <MapView
              center={[32.08, 34.78]}
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
      </div>

      <div className="navbar">
        <Navbar
          landingCount={landings.length}
          alienCount={aliens.length}
          onActivateCreate={() => {
            setCreateMode(true);
            setCursorStyle("crosshair");
          }}
          onRequestClearAll={() => setShowConfirmDeleteAll(true)}
        />
      </div>

      <div className="bottombar">
        <BottomBar
          onJump={handleJump}
          onCallback={() => setShowConfirmDeleteTakilas(true)}
          fighters={fighters}
          takilas={takilas}
        />
      </div>

      {showConfirmDeleteAll && (
        <ConfirmDialog
          message="Delete all landings and aliens?"
          onConfirm={handleClearLandingsAliens}
          onCancel={() => setShowConfirmDeleteAll(false)}
        />
      )}

      {showConfirmDeleteTakilas && (
        <ConfirmDialog
          message="Delete all takilas and fighters?"
          onConfirm={handleClearTakilasFighters}
          onCancel={() => setShowConfirmDeleteTakilas(false)}
        />
      )}

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

      <AlienManager aliens={aliens} setAliens={setAliens} />
      <TakilaManager takilas={takilas} setTakilas={setTakilas} />
      <FighterManager takilas={takilas} aliens={aliens} />
      <DefenseManager
        fighters={fighters}
        aliens={aliens}
        setFighters={setFighters}
        setExplosions={setExplosions}
      />
      <ExplosionManager explosions={explosions} setExplosions={setExplosions} />
      <FighterMovementManager
        fighters={fighters}
        setFighters={setFighters}
        aliens={aliens}
        setTakilas={setTakilas}
      />
    </div>
  );
}
