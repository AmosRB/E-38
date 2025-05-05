import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
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
  const getPosition = (item) =>
    item.route && item.route.length > 0 && item.positionIdx !== undefined
      ? [item.route[item.positionIdx][0], item.route[item.positionIdx][1]]
      : [item.lat, item.lng];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <ClickHandler onMapClick={onMapClick} />

      {landings.map(l => (
        <Marker key={`landing-${l.id}`} position={getPosition(l)} icon={createEmojiIcon('🛸', l.landingCode)}>
          <Popup>{l.locationName || `Landing ${l.landingCode}`}</Popup>
        </Marker>
      ))}

      {aliens.map(a => (
        <React.Fragment key={`alien-${a.id}`}>
          <Marker position={getPosition(a)} icon={createEmojiIcon('👽', a.alienCode)}>
            <Popup>{`Alien ${a.alienCode}`}</Popup>
          </Marker>
          {a.route && a.route.length > 0 && (
            <Polyline positions={a.route.map(p => [p[0], p[1]])} color="purple" />
          )}
        </React.Fragment>
      ))}

{takilas.map(t => (
  <Marker key={t.id} position={[t.lat, t.lng]} icon={takilaIcon}>
    <Popup>
      <div>
        <strong>Takila {t.id}</strong><br />
        Status: {t.status}<br />
        Fighters Alive: {t.fightersAlive}
      </div>
    </Popup>
  </Marker>
))}


      {fighters.map(f => (
        <Marker key={`fighter-${f.id}`} position={getPosition(f)} icon={createEmojiIcon('🧍', f.phase)}>
          <Popup>{`Fighter`}</Popup>
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
