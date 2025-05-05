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
    [[lat + 0.002, lng], [lat + 0.003, lng], [lat + 0.004, lng]],
    [[lat - 0.002, lng], [lat - 0.003, lng], [lat - 0.004, lng]],
    [[lat, lng + 0.002], [lat, lng + 0.003], [lat, lng + 0.004]],
    [[lat, lng - 0.002], [lat, lng - 0.003], [lat, lng - 0.004]],
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
  const now = Date.now();
  shots = [];

 for (const a of aliens) {
    a.positionIdx = (a.positionIdx + 1);
    if (a.positionIdx >= a.route.length) {
      a.route = await getRoute(a.lat, a.lng);
      a.positionIdx = 0;
    }
    a.lat = a.route[a.positionIdx][0];
    a.lng = a.route[a.positionIdx][1];
  }

  for (const t of takilas) {
    if (t.status === 'WAITING') continue;

    const nearestAlien = aliens.find(a => {
      const dx = a.lat - t.lat;
      const dy = a.lng - t.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111;
      return dist < 3;
    });

    if (nearestAlien) {
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

  for (const f of fighters) {
    if (!f.isAlive) continue;

    f.positionIdx++;
    if (f.positionIdx >= f.route.length) {
      if (f.phase === 'scatter') {
        f.route = generateRandomRoute(f.lat, f.lng);
        f.phase = 'random';
      } else if (f.phase === 'random') {
        const target = aliens.find(a => a.id === f.targetId);
        if (target) {
          f.route = [
            [f.lat + (target.lat - f.lat) * 0.3, f.lng + (target.lng - f.lng) * 0.3],
            [f.lat + (target.lat - f.lat) * 0.6, f.lng + (target.lng - f.lng) * 0.6],
            [target.lat, target.lng]
          ];
          f.phase = 'chase';
        }
      } else if (f.phase === 'chase') {
        const target = aliens.find(a => a.id === f.targetId);
        if (!target || target.hitCount >= 2) {
          const homeTakila = takilas.find(t => t.id === f.takilaId);
          if (homeTakila) {
            f.route = [[homeTakila.lat, homeTakila.lng]];
            f.phase = 'return';
          }
        }
      } else if (f.phase === 'return') {
        const homeTakila = takilas.find(t => t.id === f.takilaId);
        if (homeTakila) {
          const dx = homeTakila.lat - f.lat;
          const dy = homeTakila.lng - f.lng;
          const dist = Math.sqrt(dx * dx + dy * dy) * 111;
          if (dist < 0.1) {
            homeTakila.status = 'MOVING';
            homeTakila.fightersCount = 4;
            f.isAlive = false;
          }
        }
      }
      f.positionIdx = 0;
    }

    f.lat = f.route[f.positionIdx][0];
    f.lng = f.route[f.positionIdx][1];

    if (f.phase === 'chase') {
      const target = aliens.find(a => a.id === f.targetId);
      if (target) {
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
            timestamp: Date.now(),
          });
          target.hitCount += 1;
        }
      }
    }
  }

  fighters = fighters.filter(f => f.isAlive);
  aliens = aliens.filter(a => a.hitCount < 2);
  landings = landings.filter(l => l.hitCount < 4);

}, 1000);
app.get('/api/snapshot', (req, res) => {
  res.json({
    aliens: aliens.map(a => ({
      id: a.id,
      lat: a.route[a.positionIdx][0],
      lng: a.route[a.positionIdx][1],
      hitCount: a.hitCount,
      positionIdx: a.positionIdx
    })),
    fighters: fighters.map(f => ({
      id: f.id,
      lat: f.lat,
      lng: f.lng,
      takilaId: f.takilaId,
      targetId: f.targetId,
      phase: f.phase,
      isAlive: f.isAlive
    })),
    takilas: takilas.map(t => ({
      id: t.id,
      lat: t.route[t.positionIdx][0],
      lng: t.route[t.positionIdx][1],
      status: t.status,
      fightersCount: t.fightersCount,
      positionIdx: t.positionIdx
    })),
    landings: landings.map(l => ({
      id: l.id,
      lat: l.route ? l.route[l.positionIdx][0] : l.lat,
      lng: l.route ? l.route[l.positionIdx][1] : l.lng,
      hitCount: l.hitCount,
      positionIdx: l.positionIdx
    })),
    shots,
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

  takilas.push({
    id,
    lat: tRoute[0][0],
    lng: tRoute[0][1],
    status: 'MOVING',
    fightersCount: 0,
    route: tRoute,
    positionIdx: 0
  });

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
