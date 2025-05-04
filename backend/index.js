const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let aliens = [];
let fighters = [];
let takilas = [];
let landings = [];
let shots = [];

function generateRoute(lat, lng, points = 5) {
  const route = [];
  for (let i = 0; i < points; i++) {
    route.push([lat + (Math.random() - 0.5) * 0.01, lng + (Math.random() - 0.5) * 0.01]);
  }
  return route;
}

// for (let i = 0; i < 8; i++) {
//   const route = generateRoute(32, 34);
//   aliens.push({ id: i, lat: route[0][0], lng: route[0][1], hitCount: 0, route, positionIdx: 0 });
// }
// const takilaRoute = generateRoute(32, 34);
// takilas.push({ id: 100, lat: takilaRoute[0][0], lng: takilaRoute[0][1], status: 'WAITING', fightersCount: 4, route: takilaRoute, positionIdx: 0 });
// landings.push({ id: 200, lat: 32.005, lng: 34.005, hitCount: 0 });

// for (let i = 0; i < 4; i++) {
//   fighters.push({ id: 500 + i, lat: 32, lng: 34, takilaId: 100, targetId: aliens[i % aliens.length].id, phase: 'chase', isAlive: true });
// }

setInterval(() => {
  const now = Date.now();
  shots = [];

aliens.forEach(a => {
  a.positionIdx = (a.positionIdx + 1);
  if (a.positionIdx >= a.route.length) {
    a.route = generateRoute(a.lat, a.lng);
    a.positionIdx = 0;
  }
  a.lat = a.route[a.positionIdx][0];
  a.lng = a.route[a.positionIdx][1];
});

takilas.forEach(t => {
  t.positionIdx = (t.positionIdx + 1);
  if (t.positionIdx >= t.route.length) {
    t.route = generateRoute(t.lat, t.lng);
    t.positionIdx = 0;
  }
  t.lat = t.route[t.positionIdx][0];
  t.lng = t.route[t.positionIdx][1];
});
;

  fighters.forEach(f => {
    if (!f.isAlive) return;
    const target = aliens.find(a => a.id === f.targetId);
    if (!target) return;

    const dx = target.lat - f.lat;
    const dy = target.lng - f.lng;
    const dist = Math.sqrt(dx * dx + dy * dy) * 111;

    f.lat += dx * 0.01;
    f.lng += dy * 0.01;

    if (dist < 0.3) {
      shots.push({
        geometry: { coordinates: [[f.lng, f.lat], [target.lng, target.lat]] },
        properties: { shotType: 'fighter', timestamp: now },
      });
      target.hitCount += 1;
    }
  });

  aliens.forEach(a => {
    fighters.forEach(f => {
      if (!f.isAlive) return;
      const dx = a.lat - f.lat;
      const dy = a.lng - f.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111;
      if (dist < 0.2) {
        shots.push({
          geometry: { coordinates: [[a.lng, a.lat], [f.lng, f.lat]] },
          properties: { shotType: 'alien', timestamp: now },
        });
        f.isAlive = false;
        const takila = takilas.find(t => t.id === f.takilaId);
        if (takila) takila.fightersCount -= 1;
      }
    });
  });

  takilas.forEach(t => {
    landings.forEach(l => {
      const dx = t.lat - l.lat;
      const dy = t.lng - l.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111;
      if (dist < 1.5) {
        shots.push({
          geometry: { coordinates: [[t.lng, t.lat], [l.lng, l.lat]] },
          properties: { shotType: 'takila', timestamp: now },
        });
        l.hitCount += 1;
      }
    });
  });

  landings.forEach(l => {
    takilas.forEach(t => {
      const dx = l.lat - t.lat;
      const dy = l.lng - t.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111;
      if (dist < 1) {
        shots.push({
          geometry: { coordinates: [[l.lng, l.lat], [t.lng, t.lat]] },
          properties: { shotType: 'landing', timestamp: now },
        });
      }
    });
  });

  aliens = aliens.filter(a => a.hitCount < 2);
  landings = landings.filter(l => l.hitCount < 4);
  takilas = takilas.filter(t => t.fightersCount > 0);

}, 1000);

// ✅ API endpoints
app.get('/api/snapshot', (req, res) => {
  res.json({
    aliens: aliens.map(a => ({
      ...a,
      lat: a.route[a.positionIdx][0],
      lng: a.route[a.positionIdx][1],
    })),
    fighters: fighters.map(f => ({
      ...f,
      lat: f.lat,
      lng: f.lng,
    })),
    takilas: takilas.map(t => ({
      ...t,
      lat: t.route[t.positionIdx][0],
      lng: t.route[t.positionIdx][1],
    })),
    landings: landings.map(l => ({
      ...l,
      lat: l.route ? l.route[l.positionIdx][0] : l.lat,
      lng: l.route ? l.route[l.positionIdx][1] : l.lng,
    })),
    shots,
  });
});

app.use(express.json());

app.post('/api/create-landing', (req, res) => {
  const { latlng } = req.body;
  const id = Date.now();
  const route = generateRoute(latlng[0], latlng[1]);
  landings.push({ id, lat: route[0][0], lng: route[0][1], hitCount: 0, route, positionIdx: 0 });
  for (let i = 0; i < 8; i++) {
    const aRoute = generateRoute(latlng[0], latlng[1]);
    aliens.push({ id: Date.now() + i, lat: aRoute[0][0], lng: aRoute[0][1], hitCount: 0, route: aRoute, positionIdx: 0 });
  }
  res.json({ message: 'Landing created' });
});

app.post('/api/create-takila', (req, res) => {
  const { latlng } = req.body;
  const id = Date.now();
  const route = generateRoute(latlng[0], latlng[1]);
  takilas.push({ id, lat: route[0][0], lng: route[0][1], status: 'WAITING', fightersCount: 4, route, positionIdx: 0 });
  for (let i = 0; i < 4; i++) {
    fighters.push({ id: Date.now() + i, lat: latlng[0], lng: latlng[1], takilaId: id, targetId: null, phase: 'exit', isAlive: true });
  }
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

// ✅ Static + catch-all
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
