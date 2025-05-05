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

function generateRandomRoute(lat, lng) {
  const route = [];
  for (let i = 0; i < 3; i++) {
    route.push([lat + (Math.random() - 0.5) * 0.005, lng + (Math.random() - 0.5) * 0.005]);
  }
  return route;
}

setInterval(async () => {
  shots = shots.filter(s => Date.now() - s.timestamp < 2000);

  aliens.forEach(a => {
    a.positionIdx = (a.positionIdx + 1) % a.route.length;
    [a.lat, a.lng] = a.route[a.positionIdx];
  });

  for (const t of takilas) {
    if (t.status === 'WAITING') continue;

    const nearestAlien = aliens.find(a => {
      const dx = a.lat - t.lat;
      const dy = a.lng - t.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111;
      return dist < 3;
    });

    const currentFighters = fighters.filter(f => f.takilaId === t.id && f.isAlive);
    if (nearestAlien && currentFighters.length < 4) {
      t.status = 'WAITING';
      const scatterRoutes = generateFighterScatterRoutes(t.lat, t.lng);
      for (let i = 0; i < 4; i++) {
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
      continue;
    }

    t.positionIdx = (t.positionIdx + 1);
    if (t.positionIdx >= t.route.length) {
      t.route = await getRoute(t.lat, t.lng);
      t.positionIdx = 0;
    }
    t.lat = t.route[t.positionIdx][0];
    t.lng = t.route[t.positionIdx][1];
  }

  fighters.forEach(f => {
    if (!f.isAlive) return;

    const target = aliens.find(a => a.id === f.targetId);
    if (f.phase === 'chase' && target) {
      const dx = target.lat - f.lat;
      const dy = target.lng - f.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111;

      if (dist < 0.3) {
        shots.push({
          fromLat: f.lat,
          fromLng: f.lng,
          toLat: target.lat,
          toLng: target.lng,
          type: 'fighter',
          color: 'red',
          timestamp: Date.now(),
        });
        target.hitCount = (target.hitCount || 0) + 1;

        if (target.hitCount >= 2) {
          const homeTakila = takilas.find(t => t.id === f.takilaId);
          if (homeTakila) {
            f.route = [[homeTakila.lat, homeTakila.lng]];
            f.phase = 'return';
            f.positionIdx = 0;
          }
        }
        return;
      }
    }

    f.positionIdx++;
    if (f.positionIdx >= f.route.length) {
      if (f.phase === 'scatter') {
        f.route = generateRandomRoute(f.lat, f.lng);
        f.phase = 'random';
      } else if (f.phase === 'random' && target) {
        f.route = [[target.lat, target.lng]];
        f.phase = 'chase';
      } else if (f.phase === 'chase' && !target) {
        const homeTakila = takilas.find(t => t.id === f.takilaId);
        if (homeTakila) {
          f.route = [[homeTakila.lat, homeTakila.lng]];
          f.phase = 'return';
        }
      } else if (f.phase === 'return') {
        const homeTakila = takilas.find(t => t.id === f.takilaId);
        if (homeTakila) {
          const dx = homeTakila.lat - f.lat;
          const dy = homeTakila.lng - f.lng;
          const dist = Math.sqrt(dx * dx + dy * dy) * 111;
          if (dist < 0.1) {
            homeTakila.status = 'MOVING';
            f.isAlive = false;
          }
        }
      }
      f.positionIdx = 0;
    }
    [f.lat, f.lng] = f.route[f.positionIdx];
  });

  aliens = aliens.filter(a => a.hitCount < 2);
  fighters = fighters.filter(f => f.isAlive);
}, 1500);

app.get('/api/snapshot', (req, res) => {
  res.json({
    aliens: aliens.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, hitCount: a.hitCount })),
    fighters: fighters.map(f => ({ id: f.id, lat: f.lat, lng: f.lng, phase: f.phase, takilaId: f.takilaId })),
    takilas: takilas.map(t => ({ id: t.id, lat: t.lat, lng: t.lng, status: t.status })),
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
    aliens.push({ id: Date.now() + i, lat: aRoute[0][0], lng: aRoute[0][1], hitCount: 0, route: aRoute, positionIdx: 0 });
  }
  res.json({ message: 'Landing created' });
});

app.post('/api/create-takila', async (req, res) => {
  const { latlng } = req.body;
  const id = Date.now();
  const tRoute = await getRoute(latlng[0], latlng[1]);
  takilas.push({ id, lat: tRoute[0][0], lng: tRoute[0][1], status: 'MOVING', route: tRoute, positionIdx: 0 });
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
