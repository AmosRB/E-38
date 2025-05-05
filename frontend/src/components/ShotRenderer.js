import React from 'react';
import { Polyline } from 'react-leaflet';

const ShotRenderer = ({ shots }) => {
  const recentShots = shots.filter(shot => Date.now() - shot.timestamp < 5000);

  const typeColors = {
    fighter: 'red',
    alien: 'blue',
    takila: 'purple',
    landing: 'green',
  };

  return (
    <>
      {recentShots.map((shot, index) => (
        <Polyline
          key={index}
          positions={[[shot.fromLat, shot.fromLng], [shot.toLat, shot.toLng]]}
          pathOptions={{ color: typeColors[shot.type] || 'gray', weight: 2 }}
        />
      ))}
    </>
  );
};

export default ShotRenderer;
