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

setInterval(async () => {
  const now = Date.now();
  shots = [];

  for (const a of aliens) {
  if (!a.route || a.route.length === 0) {
    a.route = await getRoute(a.lat, a.lng);
    a.positionIdx = 0;
  }
  a.positionIdx = (a.positionIdx + 1);
  if (a.positionIdx >= a.route.length) {
    a.route = await getRoute(a.lat, a.lng);
    a.positionIdx = 0;
  }
  a.lat = a.route[a.positionIdx][0];
  a.lng = a.route[a.positionIdx][1];
}

for (const t of takilas) {
  if (!t.route || t.route.length === 0) {
    t.route = await getRoute(t.lat, t.lng);
    t.positionIdx = 0;
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
    const target = aliens.find(a => a.id === f.targetId);
    if (!target) continue;

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
  }

  aliens = aliens.filter(a => a.hitCount < 2);
  landings = landings.filter(l => l.hitCount < 4);
  takilas = takilas.filter(t => t.fightersCount > 0);

}, 1000);

app.get('/api/snapshot', (req, res) => {
  res.json({
    aliens,
    fighters,
    takilas,
    landings,
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
  takilas.push({ id, lat: tRoute[0][0], lng: tRoute[0][1], status: 'WAITING', fightersCount: 4, route: tRoute, positionIdx: 0 });

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

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
