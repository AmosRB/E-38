import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import { fetchSnapshot } from './components/api';
import MapView from './components/MapView';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState({
    landings: [],
    aliens: [],
    takilas: [],
    fighters: [],
    shots: []
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const snapshot = await fetchSnapshot();
      setGameState(snapshot);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAliensLandings = async () => {
    await fetch('/api/clear-landings-aliens', { method: 'DELETE' });
  };

  const handleClearTakilasFighters = async () => {
    await fetch('/api/clear-takilas-fighters', { method: 'DELETE' });
  };

  const handleCreateLanding = async () => {
    await fetch('/api/create-landing', { method: 'POST' });
  };

  const handleCreateTakila = async () => {
    await fetch('/api/create-takila', { method: 'POST' });
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
        <Navbar
          landingCount={gameState.landings.length}
          alienCount={gameState.aliens.length}
          onActivateCreate={handleCreateLanding}
          onRequestClearAll={handleClearAliensLandings}
        />
      </div>

      <div style={{ position: 'absolute', top: '50px', bottom: '50px', width: '100%' }}>
        <MapView
          center={[31.5, 34.8]}
          landings={gameState.landings}
          aliens={gameState.aliens}
          takilas={gameState.takilas}
          fighters={gameState.fighters}
          shots={gameState.shots}
          explosions={[]}
          onMapClick={() => {}}
        />
      </div>

      <div style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 1000 }}>
        <BottomBar
          fighters={gameState.fighters}
          takilas={gameState.takilas}
          onJump={handleCreateTakila}
          onCallback={handleClearTakilasFighters}
        />
      </div>
    </div>
  );
}
