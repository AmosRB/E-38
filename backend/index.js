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

// פונקציה לייצור route קצר אקראי
function generateRoute(lat, lng, points = 5) {
  const route = [];
  for (let i = 0; i < points; i++) {
    route.push([lat + (Math.random() - 0.5) * 0.01, lng + (Math.random() - 0.5) * 0.01]);
  }
  return route;
}

// אתחול דוגמתי
for (let i = 0; i < 8; i++) {
  const route = generateRoute(32, 34);
  aliens.push({
    id: i,
    lat: route[0][0],
    lng: route[0][1],
    hitCount: 0,
    route,
    positionIdx: 0
  });
}
const takilaRoute = generateRoute(32, 34);
takilas.push({
  id: 100,
  lat: takilaRoute[0][0],
  lng: takilaRoute[0][1],
  status: 'WAITING',
  fightersCount: 4,
  route: takilaRoute,
  positionIdx: 0
});
landings.push({ id: 200, lat: 32.005, lng: 34.005, hitCount: 0 });

for (let i = 0; i < 4; i++) {
  fighters.push({
    id: 500 + i,
    lat: 32,
    lng: 34,
    takilaId: 100,
    targetId: aliens[i % aliens.length].id,
    phase: 'chase',
    isAlive: true
  });
}

setInterval(() => {
  const now = Date.now();
  shots = [];

  aliens.forEach(a => {
    if (a.route) {
      a.positionIdx = (a.positionIdx + 1) % a.route.length;
      a.lat = a.route[a.positionIdx][0];
      a.lng = a.route[a.positionIdx][1];
    } else {
      a.lat += (Math.random() - 0.5) * 0.0005;
      a.lng += (Math.random() - 0.5) * 0.0005;
    }
  });

  takilas.forEach(t => {
    if (t.route) {
      t.positionIdx = (t.positionIdx + 1) % t.route.length;
      t.lat = t.route[t.positionIdx][0];
      t.lng = t.route[t.positionIdx][1];
    }
  });

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
      shots.push({ fromLat: f.lat, fromLng: f.lng, toLat: target.lat, toLng: target.lng, type: 'fighter', timestamp: now });
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
        shots.push({ fromLat: a.lat, fromLng: a.lng, toLat: f.lat, toLng: f.lng, type: 'alien', timestamp: now });
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
        shots.push({ fromLat: t.lat, fromLng: t.lng, toLat: l.lat, toLng: l.lng, type: 'takila', timestamp: now });
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
        shots.push({ fromLat: l.lat, fromLng: l.lng, toLat: t.lat, toLng: t.lng, type: 'landing', timestamp: now });
      }
    });
  });

  aliens = aliens.filter(a => a.hitCount < 2);
  landings = landings.filter(l => l.hitCount < 4);
  takilas = takilas.filter(t => t.fightersCount > 0);

}, 1000);

// API לשליחה ל-frontend
app.get('/api/snapshot', (req, res) => {
  res.json({
    aliens,
    fighters,
    takilas,
    landings,
    shots,
  });
});

// API יצירת נחיתה חדשה
app.post('/api/create-landing', (req, res) => {
  const id = Date.now();
  const route = generateRoute(32, 34);
  landings.push({ id, lat: route[0][0], lng: route[0][1], hitCount: 0, route, positionIdx: 0 });
  for (let i = 0; i < 8; i++) {
    const aRoute = generateRoute(32, 34);
    aliens.push({ id: Date.now() + i, lat: aRoute[0][0], lng: aRoute[0][1], hitCount: 0, route: aRoute, positionIdx: 0 });
  }
  res.json({ message: 'Landing created' });
});

// API יצירת טקילה חדשה
app.post('/api/create-takila', (req, res) => {
  const id = Date.now();
  const route = generateRoute(32, 34);
  takilas.push({ id, lat: route[0][0], lng: route[0][1], status: 'WAITING', fightersCount: 4, route, positionIdx: 0 });
  for (let i = 0; i < 4; i++) {
    fighters.push({ id: Date.now() + i, lat: 32, lng: 34, takilaId: id, targetId: null, phase: 'exit', isAlive: true });
  }
  res.json({ message: 'Takila created' });
});

// API מחיקת נחיתות וחייזרים
app.delete('/api/clear-landings-aliens', (req, res) => {
  landings = [];
  aliens = [];
  res.json({ message: 'Landings and aliens cleared' });
});

// API מחיקת טקילות ולוחמים
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
