import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import ShotRenderer from './components/ShotRenderer';
import { fetchSnapshot } from './components/api';
import MapView from './components/MapView';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState({ aliens: [], fighters: [], takilas: [], landings: [], shots: [] });

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
    <div>
      <Navbar
        landingCount={gameState.landings.length}
        alienCount={gameState.aliens.length}
        onActivateCreate={handleCreateLanding}
        onRequestClearAll={handleClearAliensLandings}
      />

<MapView
  center={[32, 34]}
  landings={gameState.landings}
  aliens={gameState.aliens}
  takilas={gameState.takilas}
  fighters={gameState.fighters}
  shots={gameState.shots}
  explosions={[]} // כרגע ריק, אלא אם תוסיף בהמשך
  onMapClick={() => {}} // תוכל לחבר פונקציה בהמשך
/>

      <BottomBar
        fighters={gameState.fighters}
        takilas={gameState.takilas}
        onJump={handleCreateTakila}
        onCallback={handleClearTakilasFighters}
      />
    </div>
  );
}
