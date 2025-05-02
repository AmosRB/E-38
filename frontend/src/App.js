import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import AnimationEngine from './AnimationEngine';
import ShotRenderer from './ShotRenderer';
import { fetchSnapshot } from './api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function App() {
    const [gameState, setGameState] = useState({
        aliens: [],
        fighters: [],
        takilas: [],
        landings: [],
        shots: []
    });

    const alienIcon = new L.DivIcon({ html: '👽', className: '', iconSize: [24, 24] });
    const landingIcon = new L.DivIcon({ html: '🛸', className: '', iconSize: [24, 24] });
    const takilaIcon = new L.DivIcon({ html: '🚙', className: '', iconSize: [24, 24] });
    const fighterIcon = new L.DivIcon({ html: '🧍', className: '', iconSize: [24, 24] });

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

<MapContainer
    center={[32.05, 34.85]}
    zoom={11}
    style={{ height: '100vh', width: '100%' }}
>




    <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />


                <AnimationEngine gameState={gameState} setGameState={setGameState} />
                <ShotRenderer gameState={gameState} />

                {/* ✅ FIX: check if arrays exist before mapping */}
                {gameState.landings && gameState.landings.map(l => (
                    <Marker key={`landing-${l.id}`} position={[l.lat, l.lng]} icon={landingIcon}>
                        <Popup>Landing #{l.id}</Popup>
                    </Marker>
                ))}

                {gameState.aliens && gameState.aliens.map(a => (
                    <Marker key={`alien-${a.id}`} position={[a.lat, a.lng]} icon={alienIcon}>
                        <Popup>Alien #{a.id}</Popup>
                    </Marker>
                ))}

                {gameState.takilas && gameState.takilas.map(t => (
                    <Marker key={`takila-${t.id}`} position={[t.lat, t.lng]} icon={takilaIcon}>
                        <Popup>Takila #{t.id}</Popup>
                    </Marker>
                ))}

                {gameState.fighters && gameState.fighters.map(f => (
                    <Marker key={`fighter-${f.id}`} position={[f.lat, f.lng]} icon={fighterIcon}>
                        <Popup>Fighter #{f.id}</Popup>
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
