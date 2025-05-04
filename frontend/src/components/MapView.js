import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function createEmojiIcon(emoji, label = '') {
  return L.divIcon({
    html: `<div style="font-size: 24px;">${emoji}</div><div style="font-size:10px;">${label}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function MapView({ center, landings, aliens, takilas, fighters, explosions, shots, onMapClick }) {
  const getPosition = (item) => [item.lat, item.lng];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <ClickHandler onMapClick={onMapClick} />

      {landings.map(l => (
        <Marker key={`landing-${l.id}`} position={getPosition(l)} icon={createEmojiIcon('🛸')}>
          <Popup>{`Landing ${l.id}`}</Popup>
        </Marker>
      ))}

      {aliens.map(a => (
        <Marker key={`alien-${a.id}`} position={getPosition(a)} icon={createEmojiIcon('👽')}>
          <Popup>{`Alien ${a.id}`}</Popup>
        </Marker>
      ))}

      {takilas.map(t => (
        <Marker key={`takila-${t.id}`} position={getPosition(t)} icon={createEmojiIcon('🚙')}>
          <Popup>{`Takila ${t.id}`}</Popup>
        </Marker>
      ))}

      {fighters.map(f => (
        <Marker key={`fighter-${f.id}`} position={getPosition(f)} icon={createEmojiIcon('🧍', f.phase)}>
          <Popup>{`Fighter ${f.id}`}</Popup>
        </Marker>
      ))}

      {shots.map((s, i) => (
        <Polyline
          key={`shot-${i}`}
          positions={s.geometry.coordinates.map(c => [c[1], c[0]])}
          pathOptions={{
            color:
              s.properties.shotType === 'fighter'
                ? 'red'
                : s.properties.shotType === 'alien'
                ? 'blue'
                : s.properties.shotType === 'takila'
                ? 'purple'
                : 'green',
            weight: 3,
          }}
        />
      ))}

      {explosions.map((e, i) => (
        <Marker key={`explosion-${i}`} position={[e.lat, e.lng]} icon={createEmojiIcon('💥')} />
      ))}
    </MapContainer>
  );
}
