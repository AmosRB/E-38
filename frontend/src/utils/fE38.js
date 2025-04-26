// frontend/src/utils/fE38.js

export function fE38(fighters, targetAlien) {
    if (!targetAlien || !targetAlien.route || targetAlien.route.length < 2) return fighters;
  
    const [prevLat, prevLng] = targetAlien.route[targetAlien.positionIdx - 1] || targetAlien.route[0];
    const [currLat, currLng] = targetAlien.route[targetAlien.positionIdx];
  
    const dLat = (currLat - prevLat) * Math.PI / 180;
    const dLng = (currLng - prevLng) * Math.PI / 180;
    const baseAngle = Math.atan2(dLat, dLng);
  
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(prevLat * Math.PI / 180) * Math.cos(currLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = 6371 * c;
  
    const predictedLatLng = [
      currLat + (currLat - prevLat) * 30,
      currLng + (currLng - prevLng) * 30
    ];
  
    const movePoint = (lat, lng, angle, distanceKm) => {
      const dx = distanceKm * Math.cos(angle);
      const dy = distanceKm * Math.sin(angle);
      return [
        lat + dy / 111,
        lng + dx / (111 * Math.cos(lat * Math.PI / 180))
      ];
    };
  
    return fighters.map((f, idx) => {
      let sideAngle = 0;
      if (idx % 4 === 0) sideAngle = 0;
      else if (idx % 4 === 1) sideAngle = Math.PI / 4;
      else if (idx % 4 === 2) sideAngle = -Math.PI / 4;
      else sideAngle = Math.PI;
  
      const firstMove = movePoint(f.lat, f.lng, baseAngle + sideAngle, 0.2);
      const secondMove = movePoint(firstMove[0], firstMove[1], baseAngle, 0.3);
      const finalMove = predictedLatLng;
  
      return {
        ...f,
        route: [
          [f.lat, f.lng],
          firstMove,
          secondMove,
          finalMove
        ],
        positionIdx: 0,
        moving: true
      };
    });
  }
  