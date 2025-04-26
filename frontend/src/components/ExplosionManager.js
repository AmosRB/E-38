import { useEffect } from 'react';

export default function ExplosionManager({ explosions, setExplosions }) {
  useEffect(() => {
    if (explosions.length === 0) return;

    const timers = explosions.map((exp, idx) =>
      setTimeout(() => {
        setExplosions(prev => prev.filter((_, i) => i !== idx));
      }, exp.type === 'explosion' ? 2000 : 3000) // 💥 נמחק אחרי 2 שניות, 🧎‍♂️❌ אחרי 3 שניות
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [explosions, setExplosions]);

  return null;
}
