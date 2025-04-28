import { useEffect } from 'react';

export default function FighterMovementManager({ fighters, setFighters, aliens, setTakilas }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setFighters(prevFighters => prevFighters.map(f => {
        if (!f.moving || !Array.isArray(f.route) || f.route.length === 0) {
          return f; // אם אין תנועה או מסלול תקין, לא משנים
        }

        const currentPos = f.route[f.positionIdx];
        const nextPos = f.route[f.positionIdx + 1];

        if (!currentPos || !nextPos) {
          return f; // אין נקודה הבאה => לא לזוז
        }

        const moveLat = nextPos[0] - currentPos[0];
        const moveLng = nextPos[1] - currentPos[1];

        const distance = Math.sqrt(moveLat * moveLat + moveLng * moveLng);

        const moveStep = (f.speed || 3000) / 100000;

        if (distance < moveStep) {
          if (f.positionIdx < f.route.length - 2) {
            return { ...f, positionIdx: f.positionIdx + 1 };
          } else {
            return { ...f, moving: false, phase: "waiting" };
          }
        }

        return {
          ...f,
          lat: currentPos[0] + moveLat * (moveStep / distance),
          lng: currentPos[1] + moveLng * (moveStep / distance)
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [fighters, setFighters, aliens, setTakilas]);

  return null;
}
