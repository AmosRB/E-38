import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

export default function MapView({ center, landings, aliens, takilas, fighters, explosions, shots, onMapClick }) {
  const getPosition = (item) =>
    item.route && item.route.length > 0 && item.positionIdx !== undefined
      ? [item.route[item.positionIdx][0], item.route[item.positionIdx][1]]
      : [item.lat, item.lng];

  return (
    <>
      <MapContainer center={center} zoom={12} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <ClickHandler onMapClick={onMapClick} />

        {/* 🛸 נחיתות */}
        {landings.map(l => (
          <Marker key={`landing-${l.id}`} position={getPosition(l)} icon={createEmojiIcon('🛸', l.landingCode)}>
            <Popup>{l.locationName}</Popup>
          </Marker>
        ))}

        {/* 👽 חייזרים */}
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

        {/* 🚙 טקילות */}
        {takilas.map(t => (
          <Marker
            key={`takila-${t.id}`}
            position={getPosition(t)}
            icon={createEmojiIcon('🚙', t.takilaCode, t.showFightersOut ? 'WAITING' : '')}
          >
            <Popup>{`Takila ${t.takilaCode}`}</Popup>
          </Marker>
        ))}

        {/* 🧍 לוחמים */}
        {fighters.map(f => (
          <Marker
            key={`fighter-${f.id}`}
            position={getPosition(f)}
            icon={createEmojiIcon('🧍', f.phase)}
          >
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
