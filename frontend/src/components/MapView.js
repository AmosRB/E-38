// ✅ MapView.js מושלם: כולל WAITING, יריות ופיצוצים

import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createEmojiIcon = (emoji, label = '', extraHtml = '') => L.divIcon({
  html: `<div style="display: flex; flex-direction: column; align-items: center; font-size: 24px; position: relative;">
    ${extraHtml ? `<div style="color: #cc66ff; font-weight: bold; font-size: 12px; margin-bottom: 2px;">${extraHtml}</div>` : ''}
    <div>${emoji}</div>
    ${label ? `<div style="font-size: 10px; color: white; background: black; border-radius: 4px; padding: 0 2px; margin-top: 2px;">${label}</div>` : ''}
  </div>`,
  className: ''
});

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function MapView({ center, landings, aliens, takilas, fighters, explosions, shots, onMapClick }) {
  return (
    <>
      <MapContainer center={center} zoom={12} style={{ height: '100vh', width: '100%' }}>
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
          a.route && a.route.length > 0 && a.route[a.positionIdx] && (
            <React.Fragment key={`alien-${a.id}`}>
              <Marker
                position={[a.route[a.positionIdx][0], a.route[a.positionIdx][1]]}
                icon={createEmojiIcon('👽', a.alienCode)}
              >
                <Popup>{`Alien ${a.alienCode}`}</Popup>
              </Marker>
              <Polyline positions={a.route.map(p => [p[0], p[1]])} color="purple" />
            </React.Fragment>
          )
        ))}

        {/* 🚙 טקילות */}
        {takilas.map(t => (
          t.route && t.route[t.positionIdx] && (
            <Marker
              key={`takila-${t.id}`}
              position={[t.route[t.positionIdx][0], t.route[t.positionIdx][1]]}
              icon={createEmojiIcon('🚙', t.takilaCode, t.showFightersOut ? 'WAITING' : '')}
            >
              <Popup>{`Takila ${t.takilaCode}`}</Popup>
            </Marker>
          )
        ))}

        {/* 🧍 לוחמים */}
        {fighters.map(f => (
          <Marker
            key={`fighter-${f.id}`}
            position={[f.lat, f.lng]}
            icon={createEmojiIcon('🧍', f.phase)}
          >
            <Popup>{`Fighter`}</Popup>
          </Marker>
        ))}

        {/* 🔫 יריות */}
        {shots.map((s, i) => (
          <Polyline
            key={`shot-${i}`}
            positions={[[s.from[0], s.from[1]], [s.to[0], s.to[1]]]} 
            pathOptions={{ color: 'red', weight: 3 }}
          />
        ))}

        {/* 💥 פיצוצים */}
        {explosions.map((e, i) => (
          <Marker
            key={`explosion-${i}`}
            position={[e.lat, e.lng]}
            icon={createEmojiIcon('💥')}
          />
        ))}

      </MapContainer>
    </>
  );
}
