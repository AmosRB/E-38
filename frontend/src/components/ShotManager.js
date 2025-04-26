import { useState, useEffect } from 'react';
import BattleManager from './BattleManager';

export default function ShotManager({ fighters, aliens, setAliens, setExplosions, children }) {
  const [shots, setShots] = useState([]);

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
        setShots={setShots}
        setExplosions={setExplosions} // ✅ להוסיף כאן
      />
      {children(shots)}
    </>
  );
}
