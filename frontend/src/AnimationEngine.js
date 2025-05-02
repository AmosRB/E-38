import { useEffect } from 'react';

export default function AnimationEngine({ gameState, setGameState }) {
  useEffect(() => {
    let frameId;

    const animate = () => {
      const time = Date.now();

      const updatedAliens = gameState.aliens.map(a => ({
        ...a,
        lat: a.lat + Math.sin(time / 500 + a.id) * 0.0001,
        lng: a.lng + Math.cos(time / 500 + a.id) * 0.0001,
      }));

      setGameState(prev => ({
        ...prev,
        aliens: updatedAliens,
      }));

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frameId);
  }, [gameState, setGameState]);

  return null;
}
