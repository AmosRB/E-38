import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🌟 יצירת אייקון מתוקן
// 🌟 יצירת אייקון מתוקן
const createEmojiIcon = (emoji, label = '', extraHtml = '') => L.divIcon({
  html: `<div style="display: flex; flex-direction: column; align-items: center; font-size: 24px; position: relative;">
  ${extraHtml ? `<div style="margin-bottom: 0px;">${extraHtml}</div>` : ''}
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
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <MapContainer center={center} zoom={12} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ClickHandler onMapClick={onMapClick} />

        {/* 🛸 נחיתות */}
        {landings.map(l => (
          <Marker key={`landing-${l.id}`} position={[l.lat, l.lng]} icon={createEmojiIcon('🛸', l.landingCode)}>
            <Popup>{l.locationName}</Popup>
          </Marker>
        ))}

        {/* 👽 חייזרים */}
        {aliens.map(a => (
          a.route && a.route.length > 0 && (
            <React.Fragment key={`alien-${a.id}`}>
              <Marker
                position={[a.route[a.positionIdx][0], a.route[a.positionIdx][1]]}
                icon={createEmojiIcon('👽', a.alienCode)}
              >
                <Popup>{`Alien ${a.alienCode}`}</Popup>
              </Marker>
              <Polyline positions={a.route} color="purple" />
            </React.Fragment>
          )
        ))}

        {/* 🚙 טקילות */}
        {takilas.map(t => (
  <Marker
    key={`takila-${t.id}`}
    position={[t.lat, t.lng]}
    icon={createEmojiIcon('🚙', t.takilaCode, t.showFightersOut ? `
      <div style="color: white; background: purple; padding: 1px 4px; border-radius: 4px; font-size: 8px;">
        WAITING
      </div>
    ` : '')}
  >
    <Popup>{`Takila ${t.takilaCode}`}</Popup>
  </Marker>
))}




        {/* 🧑‍⚖️ לוחמים */}
        {fighters.map(f => (
          <React.Fragment key={`fighter-${f.id}`}>
            <Marker
              position={[f.lat, f.lng]}
              icon={createEmojiIcon('🧍', f.fighterCode)}
            >
              <Popup>{`Fighter ${f.fighterCode}`}</Popup>
            </Marker>
            {f.route && f.route.length > 1 && (
              <Polyline
                positions={f.route.map(point => [point[0], point[1]])}
                color="blue"
              />
            )}
          </React.Fragment>
        ))}

        {/* 🔫 יריות */}
        {shots && shots.map((shot, idx) => (
          <Polyline
            key={`shot-${idx}`}
            positions={[shot.from, shot.to]}
            color="red"
            weight={3}
          />
        ))}

        {/* 💥 פיצוצים */}
        {explosions && explosions.map((exp, idx) => (
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