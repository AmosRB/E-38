import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createEmojiIcon = (emoji, label = '', extraHtml = '') => L.divIcon({
  html: `<div style="display: flex; flex-direction: column; align-items: center; font-size: 24px; position: relative;">
          <div>${emoji}</div>
          <div style="font-size: 12px; color: white; background: black; border-radius: 4px; padding: 0 2px; margin-top: 2px;">${label}</div>
          ${extraHtml}
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
    <>
      <style>
      {`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}
      </style>

      <MapContainer center={center} zoom={10} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ClickHandler onMapClick={onMapClick} />

        {/* נחיתות */}
        {landings.map(l => (
          <Marker key={`landing-${l.id}`} position={[l.lat, l.lng]} icon={createEmojiIcon('🛸', l.landingCode)}>
            <Popup>{l.locationName}</Popup>
          </Marker>
        ))}

        {/* חייזרים */}
        {aliens.map(a => (
          a.route && a.route.length > 0 && (
            <React.Fragment key={`alien-${a.id}`}>
              <Marker position={[a.route[a.positionIdx][0], a.route[a.positionIdx][1]]} icon={createEmojiIcon('👽', a.alienCode)}>
                <Popup>Alien {a.alienCode}</Popup>
              </Marker>
              <Polyline positions={a.route} color="purple" />
            </React.Fragment>
          )
        ))}

        {/* טקילות */}
        {takilas.map(t => (
          <Marker
            key={`takila-${t.id}`}
            position={[t.lat, t.lng]}
            icon={createEmojiIcon('🚙', '', t.showFightersOut ? `
              <div style="
                margin-top: 4px;
                background-color: #001f3f;
                color: white;
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
                animation: fadeInOut 5s forwards;
              ">
                Fighters Out
              </div>
            ` : '')}
          >
            <Popup>Takila Unit</Popup>
          </Marker>
        ))}

   {/* לוחמים */}
{fighters.map(f => (
  <React.Fragment key={`fighter-${f.id}`}>
    <Marker position={[f.lat, f.lng]} icon={createEmojiIcon('🧍', '')}>
      <Popup>Fighter</Popup>
    </Marker>

    {/* נתיב הלוחם */}
    {f.route && f.route.length > 1 && (
      <Polyline
        positions={f.route.map(point => [point[0], point[1]])}
        color="blue" // כחול ללוחמים מסלול צבע
      />
    )}
  </React.Fragment>
))}


        {/* פיצוצים */}
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
    </>
  );
}
