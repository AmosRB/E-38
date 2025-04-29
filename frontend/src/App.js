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
  const [isDeleting, setIsDeleting] = useState(false);

  const [createMode, setCreateMode] = useState(false);
  const [createTakilaMode, setCreateTakilaMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [showConfirmDeleteTakilas, setShowConfirmDeleteTakilas] = useState(false);

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

    const landingId = Date.now();

 const landingFeature = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [latlng.lng, latlng.lat] },
  properties: { type: "landing", id: landingId }
};


    try {
      await axios.post('https://e-38.onrender.com/api/update-invasion', {
        type: "FeatureCollection",
        features: [landingFeature]
      });
      console.log('🛸 Landing created on server');

      const directions = [0, 45, 90, 135, 180, 225, 270, 315];
      for (let index = 0; index < directions.length; index++) {
        const alienCode = String.fromCharCode(65 + (landings.length % 26)) + (index + 1);
        await axios.post('https://e-38.onrender.com/api/create-alien', {
          lat: latlng.lat,
          lng: latlng.lng,
          landingId,
          alienCode
        });
        console.log(`👽 Alien ${alienCode} created`);
      }
    } catch (err) {
      console.error('❌ Failed to create landing or aliens:', err.message);
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
          onActivateCreate={() => { setCreateMode(true); setCursorStyle("crosshair"); }}
          onRequestClearAll={() => setShowConfirmDeleteAll(true)}
        />
      </div>

      <div className="bottombar">
        <BottomBar onJump={handleJump} onCallback={handleCallback} fighters={fighters} takilas={takilas} />
      </div>

      {showConfirmDeleteTakilas && (
        <ConfirmDialog
          message="Are you sure you want to delete all Takilas?"
          onConfirm={handleConfirmDeleteTakilas}
          onCancel={() => setShowConfirmDeleteTakilas(false)}
        />
      )}


  {showConfirmDeleteAll && (
  <ConfirmDialog
    message="Are you sure you want to delete all landings?"
    onConfirm={handleConfirmDeleteAll}
    onCancel={() => setShowConfirmDeleteAll(false)}
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
        isDeleting={isDeleting}
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
      <DefenseManager fighters={fighters} aliens={aliens} setFighters={setFighters} setExplosions={setExplosions} />
      <ExplosionManager explosions={explosions} setExplosions={setExplosions} />
      <FighterMovementManager fighters={fighters} setFighters={setFighters} aliens={aliens} setTakilas={setTakilas} />
    </div>
  );
} 
