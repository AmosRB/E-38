// ✅ index.js — גרסה שלמה, מסודרת ומוכנה עם יריות מסונכרנות וצבעים

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const polyline = require('polyline');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let landings = [];
let aliens = [];
let takilas = [];
let fighters = [];
let shots = [];
let explosions = [];

const takilaCounters = { current: 0 };

function getTakilaCode() {
  const num = takilaCounters.current++;
  const toCode = n => {
    let code = '';
    while (n >= 0) {
      code = String.fromCharCode((n % 26) + 65) + code;
      n = Math.floor(n / 26) - 1;
    }
    return code;
  };
  return `#${toCode(num)}`;
}

function generateRandomRoute(startLat, startLng) {
  const route = [[startLat, startLng]];
  let currentLat = startLat;
  let currentLng = startLng;
  for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distKm = 0.3 + Math.random() * 0.2;
    currentLat += (distKm * Math.sin(angle)) / 111;
    currentLng += (distKm * Math.cos(angle)) / (111 * Math.cos(currentLat * Math.PI / 180));
    route.push([currentLat, currentLng]);
  }
  return route;
}

function createSingleFighter(takila) {
  const startLat = takila.lat;
  const startLng = takila.lng;
  const randomRoute = generateRandomRoute(startLat, startLng);
  return {
    id: Date.now() + Math.random(),
    lat: startLat,
    lng: startLng,
    homeLat: startLat,
    homeLng: startLng,
    route: randomRoute,
    positionIdx: 0,
    takilaCode: takila.takilaCode,
    phase: 'exit',
    lastUpdated: Date.now(),
    fighterCode: Math.random().toString(36).substring(2, 7)
  };
}

setInterval(async () => {
  const now = Date.now();
  shots = shots.filter(s => now - s.timestamp < 500);
  explosions = explosions.filter(e => now - e.timestamp < 2000);
 


  for (const f of fighters) {
    if (Math.random() < 0.1) {
      const randomLat = f.lat + (Math.random() - 0.5) * 0.01;
      const randomLng = f.lng + (Math.random() - 0.5) * 0.01;
      shots.push({ from: [f.lat, f.lng], to: [randomLat, randomLng], timestamp: Date.now(), type: 'fighter' });
    }
  }
 for (const a of aliens) {
  if (a.route && a.positionIdx < a.route.length - 1) {
    a.positionIdx++;
    a.lat = a.route[a.positionIdx][0];
    a.lng = a.route[a.positionIdx][1];
  } else {
    const from = a.route[a.route.length - 1];
    const angle = Math.random() * 360;
    const to = [
      from[0] + 0.05 * Math.cos(angle * Math.PI / 180),
      from[1] + 0.05 * Math.sin(angle * Math.PI / 180)
    ];
    const newRoute = await getRouteServer(from, to);
    a.route = newRoute;
    a.positionIdx = 0;
    explosions.push({ lat: a.lat, lng: a.lng, type: 'explosion', timestamp: Date.now() });
  }
}

  for (const t of takilas) {
    if (Math.random() < 0.05) {
      const randomLat = t.lat + (Math.random() - 0.5) * 0.01;
      const randomLng = t.lng + (Math.random() - 0.5) * 0.01;
      shots.push({ from: [t.lat, t.lng], to: [randomLat, randomLng], timestamp: Date.now(), type: 'takila' });
    }
  }
  for (const l of landings) {
    if (Math.random() < 0.05) {
      const randomLat = l.lat + (Math.random() - 0.5) * 0.01;
      const randomLng = l.lng + (Math.random() - 0.5) * 0.01;
      shots.push({ from: [l.lat, l.lng], to: [randomLat, randomLng], timestamp: Date.now(), type: 'landing' });
    }
  }
}, 1000);

async function getRouteServer(from, to) {
  try {
    const res = await axios.get(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=polyline`);
    return polyline.decode(res.data.routes[0].geometry).map(([lat, lng]) => [lat, lng]);
  } catch (err) {
    console.error('❌ Failed to fetch route:', err.message);
    return [from];
  }
}

async function createTakila(lat, lng) {
  const randomLat = lat + (Math.random() - 0.5) * 0.1;
  const randomLng = lng + (Math.random() - 0.5) * 0.1;
  const route = await getRouteServer([lat, lng], [randomLat, randomLng]);

  takilas.push({
    id: Date.now(),
    lat,
    lng,
    route,
    positionIdx: 0,
    takilaCode: getTakilaCode(),
    showFightersOut: false
  });
}

async function createAlien(lat, lng, landingId, alienCode) {
  const angle = Math.random() * 360;
  const to = [
    lat + 0.05 * Math.cos(angle * Math.PI / 180),
    lng + 0.05 * Math.sin(angle * Math.PI / 180)
  ];
  const route = await getRouteServer([lat, lng], to);

  aliens.push({
    id: Date.now() + Math.random(),
    landingId,
    alienCode,
    route,
    positionIdx: 0,
    lastUpdated: Date.now()
  });
}

app.post('/api/create-fighters', async (req, res) => {
  const { takilaId } = req.body;

  const takila = takilas.find(t => t.id === takilaId);

  if (!takila) {
    return res.status(404).json({ error: 'Takila not found' });
  }

  const modes = ['forward', 'back', 'left', 'right'];
  const newFighters = [];

  for (let i = 0; i < 4; i++) {
    const fighter = createSingleFighter(takila, modes[i]);
    newFighters.push(fighter);
  }

  fighters.push(...newFighters);
  takila.showFightersOut = true;

  console.log(`✅ Fighters created for takila ${takila.id} with random routes`);

  res.status(201).json({ fighters: newFighters });
});

app.post('/api/create-takila', async (req, res) => {
  const { lat, lng } = req.body;
  await createTakila(lat, lng);
  res.json({ message: '🚙 Takila created' });
});

app.post('/api/create-alien', async (req, res) => {
  const { lat, lng, landingId, alienCode } = req.body;
  await createAlien(lat, lng, landingId, alienCode);
  res.json({ message: '👽 Alien created' });
});

app.post('/api/update-invasion', (req, res) => {
  const { features } = req.body;
  for (const f of features) {
    if (f.properties?.type === 'landing') {
      const id = f.properties.id;
      if (!landings.find(l => l.id === id)) {
        const landingCode = String.fromCharCode(65 + (landings.length % 26));
        landings.push({
          id,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          locationName: f.properties.locationName || 'Unknown',
          createdAt: new Date().toISOString(),
          landingCode,
          lastUpdated: Date.now()
        });
      }
    }
  }
  res.json({ message: '✅ Landing added' });
});

app.get('/api/invasion', (req, res) => {
  const landingFeatures = landings.map(l => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [l.lng, l.lat] }, properties: { id: l.id, type: 'landing', locationName: l.locationName, landingCode: l.landingCode } }));
  const alienFeatures = aliens.map(a => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [a.lng, a.lat] }, properties: { id: a.id, type: 'alien', landingId: a.landingId, alienCode: a.alienCode, route: a.route, positionIdx: a.positionIdx } }));
  const takilaFeatures = takilas.map(t => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [t.lng, t.lat] }, properties: { id: t.id, type: 'takila', takilaCode: t.takilaCode, showFightersOut: t.showFightersOut, route: t.route, positionIdx: t.positionIdx, status: t.showFightersOut ? 'WAITING' : '' } }));
  const fighterFeatures = fighters.map(f => ({ type: 'Feature', geometry: { type: 'Point', coordinates: f.route[f.positionIdx] ? [f.route[f.positionIdx][1], f.route[f.positionIdx][0]] : [f.lng || 0, f.lat || 0] }, properties: { id: f.id, type: 'fighter', fighterCode: f.fighterCode, takilaCode: f.takilaCode, phase: f.phase, lat: f.lat, lng: f.lng, homeLat: f.homeLat, homeLng: f.homeLng, route: f.route, positionIdx: f.positionIdx, lastUpdated: f.lastUpdated } }));
  const explosionFeatures = explosions.map(e => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [e.lng, e.lat] }, properties: { type: e.type } }));
  const shotFeatures = shots.map(s => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[s.from[1], s.from[0]], [s.to[1], s.to[0]]] }, properties: { type: 'shot', timestamp: s.timestamp, shotType: s.type } }));
  res.json({ type: 'FeatureCollection', features: [...landingFeatures, ...alienFeatures, ...takilaFeatures, ...fighterFeatures, ...explosionFeatures, ...shotFeatures] });
});


app.delete('/api/clear-all', (req, res) => {
  landings = [];
  aliens = [];
  takilas = [];
  fighters = [];
  res.json({ message: '✅ All cleared' });
});


// ✅ הגשת קבצי React
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});


app.listen(PORT, () => console.log('🛡️ Server running on port ' + PORT));
