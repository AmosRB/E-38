import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import MapView from './components/MapView';
import { fetchSnapshot, createLanding } from './components/api';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState({
    landings: [],
    aliens: [],
    takilas: [],
    fighters: [],
    shots: []
  });
  const [isPlacingLanding, setIsPlacingLanding] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const snapshot = await fetchSnapshot();
      setGameState(snapshot);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClearAliensLandings = async () => {
    await fetch('/api/clear-landings-aliens', { method: 'DELETE' });
  };

  const handleClearTakilasFighters = async () => {
    await fetch('/api/clear-takilas-fighters', { method: 'DELETE' });
  };

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

      {isPlacingLanding && (
        <div style={{
          position: 'fixed',
          pointerEvents: 'none',
          fontSize: '30px',
          top: mouseY,
          left: mouseX,
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }}>
          🛸
        </div>
      )}

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
      await createLanding(latlng);
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
