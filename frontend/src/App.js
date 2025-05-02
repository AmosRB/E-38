import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import AnimationEngine from './AnimationEngine';
import ShotRenderer from './ShotRenderer';
import { fetchSnapshot } from './api';
import L from 'leaflet';

export default function App() {
  const [gameState, setGameState] = useState({ aliens: [], fighters: [], takilas: [], landings: [], shots: [] });

  const alienIcon = new L.DivIcon({
    html: '👽',
    className: '',
    iconSize: [24, 24]
  });

  const landingIcon = new L.DivIcon({
    html: '🛸',
    className: '',
    iconSize: [24, 24]
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
    <>
      <Navbar
        landingCount={gameState.landings.length}
        alienCount={gameState.aliens.length}
        onActivateCreate={handleCreateLanding}
        onRequestClearAll={handleClearAliensLandings}
      />

      <MapContainer center={[32.05, 34.85]} zoom={11} style={{ height: '90vh' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AnimationEngine gameState={gameState} />
        <ShotRenderer gameState={gameState} />

        {/* נחיתות */}
        {gameState.landings.map(l => (
          <Marker key={`landing-${l.id}`} position={[l.lat, l.lng]} icon={landingIcon}>
            <Popup>Landing #{l.id}</Popup>
          </Marker>
        ))}

        {/* חייזרים */}
        {gameState.aliens.map(a => (
          <Marker key={`alien-${a.id}`} position={[a.lat, a.lng]} icon={alienIcon}>
            <Popup>Alien #{a.id}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <BottomBar
        fighters={gameState.fighters}
        takilas={gameState.takilas}
        onJump={handleCreateTakila}
        onCallback={handleClearTakilasFighters}
      />
    </>
  );
}
