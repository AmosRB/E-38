const express = require('express');
const cors = require('cors');
const path = require('path');
const getRoute = require('./getRoute');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let aliens = [];
let fighters = [];
let takilas = [];
let landings = [];
let shots = [];

function generateFighterScatterRoutes(lat, lng) {
  return [
    [[lat + 0.002, lng]],
    [[lat - 0.002, lng]],
    [[lat, lng + 0.002]],
    [[lat, lng - 0.002]],
  ];
}

setInterval(async () => {
  shots = shots.filter(s => Date.now() - s.timestamp < 2000);

  // aliens movement
  aliens.forEach(a => {
    a.positionIdx = (a.positionIdx + 1) % a.route.length;
    [a.lat, a.lng] = a.route[a.positionIdx];
  });

  // takila logic
  for (const t of takilas) {
    const currentFighters = fighters.filter(f => f.takilaId === t.id && f.isAlive);

    // shoot at landings
    landings.forEach(l => {
      const dist = Math.sqrt((l.lat - t.lat) ** 2 + (l.lng - t.lng) ** 2) * 111;
      if (dist <= 1.5) {
        shots.push({ fromLat: t.lat, fromLng: t.lng, toLat: l.lat, toLng: l.lng, type: 'takila', color: 'purple', timestamp: Date.now() });
        l.hitCount = (l.hitCount || 0) + 1;
      }
    });

    const nearestAlien = aliens.find(a => Math.sqrt((a.lat - t.lat) ** 2 + (a.lng - t.lng) ** 2) * 111 < 3);

    if (nearestAlien && currentFighters.length === 0) {
      t.status = 'WAITING';
      const scatterRoutes = generateFighterScatterRoutes(t.lat, t.lng);
      for (let i = 0; i < t.fightersAlive; i++) {
        fighters.push({
          id: Date.now() + i,
          lat: t.lat,
          lng: t.lng,
          takilaId: t.id,
          targetId: nearestAlien.id,
          phase: 'scatter',
          isAlive: true,
          route: scatterRoutes[i],
          positionIdx: 0,
        });
      }
    }

    if (t.fightersAlive === 0) {
      takilas = takilas.filter(x => x.id !== t.id);
      continue;
    }

    t.positionIdx = (t.positionIdx + 1) % t.route.length;
    [t.lat, t.lng] = t.route[t.positionIdx];
  }

  // landings shoot at takila
  landings.forEach(l => {
    takilas.forEach(t => {
      const dist = Math.sqrt((t.lat - l.lat) ** 2 + (t.lng - l.lng) ** 2) * 111;
      if (dist <= 1) {
        shots.push({ fromLat: l.lat, fromLng: l.lng, toLat: t.lat, toLng: t.lng, type: 'landing', color: 'green', timestamp: Date.now() });
      }
    });
  });

  // fighters logic
  fighters.forEach(f => {
    if (!f.isAlive) return;
    const target = aliens.find(a => a.id === f.targetId);

    if (f.phase === 'scatter' && f.positionIdx === f.route.length - 1) {
      if (target) {
        f.phase = 'chase';
        f.route = [[f.lat, f.lng], [target.lat, target.lng]];
        f.positionIdx = 0;
      }
    }

    if (f.phase === 'chase' && target) {
      const dist = Math.sqrt((target.lat - f.lat) ** 2 + (target.lng - f.lng) ** 2) * 111;
      if (dist < 0.3) {
        shots.push({ fromLat: f.lat, fromLng: f.lng, toLat: target.lat, toLng: target.lng, type: 'fighter', color: 'red', timestamp: Date.now() });
        target.hitCount = (target.hitCount || 0) + 1;

        if (target.hitCount >= 2) {
          const homeTakila = takilas.find(t => t.id === f.takilaId);
          if (homeTakila) {
            f.phase = 'return';
            f.route = [[f.lat, f.lng], [homeTakila.lat, homeTakila.lng]];
            f.positionIdx = 0;
          }
        }
      }
    }

    aliens.forEach(a => {
      const dist = Math.sqrt((f.lat - a.lat) ** 2 + (f.lng - a.lng) ** 2) * 111;
      if (dist < 0.2 && f.isAlive) {
        shots.push({ fromLat: a.lat, fromLng: a.lng, toLat: f.lat, toLng: f.lng, type: 'alien', color: 'blue', timestamp: Date.now() });
        f.isAlive = false;
        const takila = takilas.find(t => t.id === f.takilaId);
        if (takila) takila.fightersAlive = Math.max(0, takila.fightersAlive - 1);
      }
    });

    if (f.phase === 'return') {
      const homeTakila = takilas.find(t => t.id === f.takilaId);
      if (homeTakila) {
        const dist = Math.sqrt((homeTakila.lat - f.lat) ** 2 + (homeTakila.lng - f.lng) ** 2) * 111;
        if (dist < 0.1) {
          f.isAlive = false;
          homeTakila.fightersAlive += 1;
          if (fighters.filter(x => x.takilaId === homeTakila.id && x.isAlive).length === 0) {
            homeTakila.status = 'MOVING';
          }
        }
      }
    }

    f.positionIdx = (f.positionIdx + 1) % f.route.length;
    [f.lat, f.lng] = f.route[f.positionIdx];
  });

  aliens = aliens.filter(a => a.hitCount < 2);
  fighters = fighters.filter(f => f.isAlive);
  landings = landings.filter(l => {
    if (l.hitCount >= 4) {
      aliens = aliens.filter(a => a.landingId !== l.id);
      return false;
    }
    return true;
  });
}, 1500);

app.get('/api/snapshot', (req, res) => {
  res.json({
    aliens: aliens.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, hitCount: a.hitCount })),
    fighters: fighters.map(f => ({ id: f.id, lat: f.lat, lng: f.lng, phase: f.phase, takilaId: f.takilaId })),
    takilas: takilas.map(t => ({ id: t.id, lat: t.lat, lng: t.lng, status: t.status, fightersAlive: t.fightersAlive })),
    landings: landings.map(l => ({ id: l.id, lat: l.lat, lng: l.lng, hitCount: l.hitCount })),
    shots: shots.map(s => ({ fromLat: s.fromLat, fromLng: s.fromLng, toLat: s.toLat, toLng: s.toLng, type: s.type })),
  });
});

app.post('/api/create-landing', async (req, res) => {
  const { latlng } = req.body;
  const id = Date.now();
  const lRoute = await getRoute(latlng[0], latlng[1]);
  landings.push({ id, lat: lRoute[0][0], lng: lRoute[0][1], hitCount: 0, route: lRoute, positionIdx: 0 });
  for (let i = 0; i < 8; i++) {
    const aRoute = await getRoute(latlng[0], latlng[1]);
    aliens.push({ id: Date.now() + i, lat: aRoute[0][0], lng: aRoute[0][1], hitCount: 0, route: aRoute, positionIdx: 0, landingId: id });
  }
  res.json({ message: 'Landing created' });
});

app.post('/api/create-takila', async (req, res) => {
  const { latlng } = req.body;
  const id = Date.now();
  const tRoute = await getRoute(latlng[0], latlng[1]);
  takilas.push({ id, lat: tRoute[0][0], lng: tRoute[0][1], status: 'MOVING', route: tRoute, positionIdx: 0, fightersAlive: 4 });
  res.json({ message: 'Takila created' });
});

app.delete('/api/clear-landings-aliens', (req, res) => {
  landings = [];
  aliens = [];
  res.json({ message: 'Landings and aliens cleared' });
});

app.delete('/api/clear-takilas-fighters', (req, res) => {
  takilas = [];
  fighters = [];
  res.json({ message: 'Takilas and fighters cleared' });
});

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
