
import { useEffect } from 'react';

export default function AnimationEngine({ setGameState }) {
  useEffect(() => {
    let frameId;

    const animate = () => {
      const time = Date.now();

      setGameState(prev => ({
        ...prev,
        aliens: prev.aliens.map(a => ({
          ...a,
          lat: a.lat + Math.sin(time / 500 + a.id) * 0.0001,
          lng: a.lng + Math.cos(time / 500 + a.id) * 0.0001,
        })),
      }));

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frameId);
  }, [setGameState]);

  return null;
}
