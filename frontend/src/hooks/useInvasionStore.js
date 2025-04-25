import { useState, useCallback } from 'react';

export default function useInvasionStore() {
  const [landingMap, setLandingMap] = useState(new Map());
  const [alienMap, setAlienMap] = useState(new Map());

  const upsertLanding = useCallback((landing) => {
    setLandingMap(prev => new Map(prev).set(landing.id, {
      ...prev.get(landing.id),
      ...landing
    }));
  }, []);

  const upsertAliens = useCallback((aliens) => {
    setAlienMap(prev => {
      const next = new Map(prev);
      aliens.forEach(a => {
        next.set(a.id, {
          ...prev.get(a.id),
          ...a
        });
      });
      return next;
    });
  }, []);

  const getActiveAliens = useCallback(() => {
    const now = Date.now();
    return Array.from(alienMap.values()).filter(a =>
      a.lastUpdated && now - a.lastUpdated < 60000
    );
  }, [alienMap]);

  const getAliensByLandingId = useCallback((landingId) => {
    return Array.from(alienMap.values()).filter(a => a.landingId === landingId);
  }, [alienMap]);

  // ✅ נוספה הפונקציה החסרה:
  const clearAll = useCallback(() => {
    setLandingMap(new Map());
    setAlienMap(new Map());
  }, []);

  return {
    landings: Array.from(landingMap.values()),
    aliens: Array.from(alienMap.values()),
    upsertLanding,
    upsertAliens,
    getActiveAliens,
    getAliensByLandingId,
    clearAll, // ✅ חשוב!
  };
}
