import { useEffect } from 'react';

export default function AnimationEngine({ gameState }) {
  useEffect(() => {
    // תנועה רנדומלית קלה לדוגמה
    gameState.aliens.forEach(a => {
      a.lat += (Math.random() - 0.5) * 0.0001;
      a.lng += (Math.random() - 0.5) * 0.0001;
    });
  }, [gameState]);

  return null;
}

