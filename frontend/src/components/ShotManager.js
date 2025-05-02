import { useState, useEffect } from 'react';
import BattleManager from './BattleManager';

export default function ShotManager({ fighters, aliens, setAliens, setExplosions, setFighters, children, shotsFromServer }) {
  const [shots, setShots] = useState([]);

  // עדכון יריות מהשרת עם טווח זמן רחב (2000ms)
  useEffect(() => {
    if (shotsFromServer) {
      const freshShots = shotsFromServer.filter(s => Date.now() - s.properties.timestamp < 2000);
      setShots(prev => {
        // איחוד בלי כפילויות (לפי timestamp + type)
        const combined = [...prev, ...freshShots];
        const unique = combined.filter((s, index, self) =>
          index === self.findIndex(t => t.properties.timestamp === s.properties.timestamp && t.properties.shotType === s.properties.shotType)
        );
        return unique;
      });
    }
  }, [shotsFromServer]);

  // ניהול מחיקה אחידה אחרי 2000ms במקום 300ms
  useEffect(() => {
    const interval = setInterval(() => {
      setShots(prev => prev.filter(shot =>
        (shot.timestamp || shot.properties.timestamp) > Date.now() - 2000
      ));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <BattleManager
        fighters={fighters}
        aliens={aliens}
        setAliens={setAliens}
        setFighters={setFighters}
        setShots={setShots}
        setExplosions={setExplosions}
      />
      {children(shots)}
    </>
  );
}
