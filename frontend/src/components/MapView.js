import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createEmojiIcon = (emoji, label = '') => L.divIcon({
  html: `<div style="display: flex; flex-direction: column; align-items: center; font-size: 24px;">
          <div>${emoji}</div>
          <div style="font-size: 12px; color: white; background: black; border-radius: 4px; padding: 0 2px; margin-top: 2px;">${label}</div>
         </div>`
});

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function MapView({ center, landings, aliens, takilas, fighters, explosions, onMapClick }) {
  return (
    <MapContainer center={center} zoom={10} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler onMapClick={onMapClick} />

      {landings.map(l => (
        <Marker key={`landing-${l.id}`} position={[l.lat, l.lng]} icon={createEmojiIcon('🛸', l.landingCode)}>
          <Popup>{l.locationName}</Popup>
        </Marker>
      ))}

      {aliens.map(a => (
        a.route && a.route.length > 0 && (
          <>
            <Marker key={`alien-${a.id}`} position={[a.route[a.positionIdx][0], a.route[a.positionIdx][1]]} icon={createEmojiIcon('👽', a.alienCode)}>
              <Popup>Alien {a.alienCode}</Popup>
            </Marker>
            <Polyline positions={a.route} color="purple" />
          </>
        )
      ))}

      {takilas.map(t => (
        <Marker key={`takila-${t.id}`} position={[t.lat, t.lng]} icon={createEmojiIcon('🚙', '')}>
          <Popup>Takila Unit</Popup>
        </Marker>
      ))}

      {fighters.map(f => (
        <Marker key={`fighter-${f.id}`} position={[f.lat, f.lng]} icon={createEmojiIcon('🧍', '')}>
          <Popup>Fighter</Popup>
        </Marker>
      ))}

      {/* 💥 פיצוצים ונפילות */}
      {explosions?.map((exp, idx) => (
        <Marker
          key={`explosion-${idx}`}
          position={[exp.lat, exp.lng]}
          icon={createEmojiIcon(
            exp.type === 'explosion' ? '💥' : '🧎‍♂️❌',
            ''
          )}
        />
      ))}

    </MapContainer>
  );
}
