import { useEffect } from 'react';

export default function FighterMovementManager({ fighters, setFighters, aliens, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setFighters(prevFighters => prevFighters.map(f => {
        if (!Array.isArray(f.route) || f.route.length === 0 || f.positionIdx === undefined) {
          return f;
        }

        const currentPos = f.route[f.positionIdx];
        const nextPos = f.route[f.positionIdx + 1];

        if (!currentPos || !nextPos) {
          if (f.phase === "exit") {
            const targetAlien = aliens.find(a => a.id === f.targetAlienId);
            if (!targetAlien || !Array.isArray(targetAlien.route) || targetAlien.route.length === 0) {
              return { ...f, phase: "return", route: [[f.lat, f.lng], [f.homeLat, f.homeLng]], positionIdx: 0 };
            }

            const targetPos = targetAlien.route[targetAlien.positionIdx] || targetAlien.route[0];
            if (!Array.isArray(targetPos)) {
              return { ...f, phase: "return", route: [[f.lat, f.lng], [f.homeLat, f.homeLng]], positionIdx: 0 };
            }

            return {
              ...f,
              route: [[f.lat, f.lng], [targetPos[0], targetPos[1]]],
              positionIdx: 0,
              phase: "chase"
            };
          }

          if (f.phase === "return") {
            const distanceHome = Math.sqrt(
              (f.lat - f.homeLat) ** 2 +
              (f.lng - f.homeLng) ** 2
            );

            if (distanceHome < 0.0005) {
              return null; // מוחק לוחם שחזר הביתה
            }

            return f;
          }

          return f;
        }

        const moveLat = nextPos[0] - currentPos[0];
        const moveLng = nextPos[1] - currentPos[1];
        const distance = Math.sqrt(moveLat * moveLat + moveLng * moveLng);
        const moveStep = (f.speed || 2000) / 100000;

        if (distance < moveStep) {
          if (f.positionIdx < f.route.length - 2) {
            return { ...f, positionIdx: f.positionIdx + 1 };
          } else {
            return { ...f, positionIdx: f.positionIdx + 1 };
          }
        }

        return {
          ...f,
          lat: currentPos[0] + moveLat * (moveStep / distance),
          lng: currentPos[1] + moveLng * (moveStep / distance)
        };
      }).filter(f => f !== null));
    }, 1000);

    return () => clearInterval(interval);
  }, [setFighters, aliens, setTakilas]);

  return null;
}
