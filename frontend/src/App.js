import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import MapView from './components/MapView';
import { fetchSnapshot } from './components/api';
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
  const [isPlacingLanding, setIsPlacingLanding] = useState(false);


  const handleCreateTakila = async () => {
    await fetch('/api/create-takila', { method: 'POST' });
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Navbar
        landingCount={Array.isArray(gameState.landings) ? gameState.landings.length : 0}
        alienCount={Array.isArray(gameState.aliens) ? gameState.aliens.length : 0}
         onActivateCreate={() => setIsPlacingLanding(true)}
  onRequestClearAll={handleClearAliensLandings}
      />
    
      <MapView
        center={[31.5, 34.8]}
        landings={gameState.landings}
        aliens={gameState.aliens}
        takilas={gameState.takilas}
        fighters={gameState.fighters}
        shots={gameState.shots}
        explosions={[]}
        onMapClick={async (latlng) => {
    if (isPlacingLanding) {
      await fetch('/api/create-landing', { method: 'POST', body: JSON.stringify({ latlng }), headers: { 'Content-Type': 'application/json' } });
      setIsPlacingLanding(false);
    }
  }}
      />
      <BottomBar
        fighters={gameState.fighters}
        takilas={gameState.takilas}
        fightersCount={Array.isArray(gameState.fighters) ? gameState.fighters.length : 0}
        takilasCount={Array.isArray(gameState.takilas) ? gameState.takilas.length : 0}
        onJump={handleCreateTakila}
        onCallback={handleClearTakilasFighters}
      />
    </div>
  );
}
