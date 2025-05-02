import { Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

export default function ShotRenderer({ gameState }) {
    const map = useMap();

    useEffect(() => {
        if (!gameState.shots) return; // ✅ FIX: הגנה אם shots לא קיים בכלל

        gameState.shots.forEach(shot => {
            const color =
                shot.type === 'fighter' ? 'red' :
                shot.type === 'alien' ? 'blue' :
                shot.type === 'takila' ? 'purple' : 'green';

            const line = L.polyline(
                [[shot.fromLat, shot.fromLng], [shot.toLat, shot.toLng]],
                { color }
            );
            line.addTo(map);

            // ✅ FIX: ניקוי השורה אחרי 2 שניות
            setTimeout(() => map.removeLayer(line), 2000);
        });
    }, [gameState.shots, map]);

    return null;
}
