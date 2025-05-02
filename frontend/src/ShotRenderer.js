import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function ShotRenderer({ gameState }) {
    const map = useMap();

    useEffect(() => {
        if (!gameState.shots) return; // ✅ FIX: guard clause
        gameState.shots.forEach(shot => {
            const color =
                shot.type === 'fighter' ? 'red' :
                shot.type === 'alien' ? 'blue' :
                shot.type === 'takila' ? 'purple' : 'green';
            const line = L.polyline([[shot.fromLat, shot.fromLng], [shot.toLat, shot.toLng]], { color });
            line.addTo(map);
            setTimeout(() => map.removeLayer(line), 2000);
        });
    }, [gameState.shots, map]);

    return null;
}
