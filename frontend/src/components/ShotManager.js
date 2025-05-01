import { useState, useEffect } from 'react';
import BattleManager from './BattleManager';

export default function ShotManager({ fighters, aliens, setAliens, setExplosions, setFighters, children, shotsFromServer }) {
  const [shots, setShots] = useState([]);

  // סינון יריות מהשרת לפי זמן (300 מילישניות אחרונות)
  useEffect(() => {
    if (shotsFromServer) {
      setShots(shotsFromServer.filter(s => Date.now() - s.properties.timestamp < 300));
    }
  }, [shotsFromServer]);

  // ניהול יריות מקומיות (BattleManager) - מחיקה אחרי 300ms
  useEffect(() => {
    const interval = setInterval(() => {
      setShots(prev => prev.filter(shot => Date.now() - shot.timestamp < 300));
    }, 100);
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
