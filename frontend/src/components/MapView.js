import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e);
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
  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{
        height: '100vh',
        width: '100vw',
        margin: '0',
        padding: '0',
        position: 'absolute',
        top: '0',
        left: '0',
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <ClickHandler onMapClick={onMapClick} />

      {/* 🛸 נחיתות */}
      {landings.map(l => (
        <Marker key={`landing-${l.id}`} position={[l.lat, l.lng]} icon={createEmojiIcon('🛸', l.landingCode)}>
          <Popup>{l.locationName}</Popup>
        </Marker>
      ))}

      {/* 👽 חייזרים */}
      {aliens.map(a => (
        <React.Fragment key={`alien-${a.id}`}>
          <Marker position={[a.lat, a.lng]} icon={createEmojiIcon('👽', a.alienCode)}>
            <Popup>{`Alien ${a.alienCode}`}</Popup>
          </Marker>
          {a.route && a.route.length > 0 && (
            <Polyline positions={a.route.map(p => [p[0], p[1]])} color="purple" />
          )}
        </React.Fragment>
      ))}

      {/* 🚙 טקילות */}
      {takilas.map(t => (
        <Marker
          key={`takila-${t.id}`}
          position={[t.lat, t.lng]}
          icon={createEmojiIcon('🚙', t.takilaCode, t.showFightersOut ? 'WAITING' : '')}
        >
          <Popup>{`Takila ${t.takilaCode}`}</Popup>
        </Marker>
      ))}

      {/* 🧍 לוחמים */}
      {fighters.map(f => (
        <Marker key={`fighter-${f.id}`} position={[f.lat, f.lng]} icon={createEmojiIcon('🧍', f.phase)}>
          <Popup>{`Fighter`}</Popup>
        </Marker>
      ))}

      {/* 🔫 יריות */}
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

      {/* 💥 פיצוצים */}
      {explosions.map((e, i) => (
        <Marker key={`explosion-${i}`} position={[e.lat, e.lng]} icon={createEmojiIcon('💥')} />
      ))}
    </MapContainer>
  );
}
