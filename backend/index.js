// ✅ index.js מלא ומעודכן - ניהול טקילות, חייזרים ולוחמים

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

const alienCounters = {};
const takilaCounters = { current: 0 };

function getTakilaCode() {
  const num = takilaCounters.current++;
  const toCode = num => {
    let code = '';
    while (num >= 0) {
      code = String.fromCharCode((num % 26) + 65) + code;
      num = Math.floor(num / 26) - 1;
    }
    return code;
  };
  return `#${toCode(num)}`;
}

async function getRouteServer(from, to) {
  try {
    const res = await axios.get(
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=polyline`
    );
    return polyline.decode(res.data.routes[0].geometry).map(([lat, lng]) => [lat, lng]);
  } catch (err) {
    console.error("❌ Server getRoute failed:", err.message);
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
    speed: 60 / 3600,
    direction: Math.random() * 360,
    lastUpdated: Date.now(),
    route,
    positionIdx: 0,
    takilaCode: getTakilaCode()
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

function createSingleFighter(takila, targetAlien, mode) {
  const startLat = takila.lat;
  const startLng = takila.lng;
  let angle = 0;

  switch (mode) {
    case 'right': angle = Math.PI / 2; break;
    case 'left': angle = -Math.PI / 2; break;
    case 'back': angle = Math.PI; break;
    case 'forward': default: angle = 0; break;
  }

  const movePoint = (lat, lng, angle, distanceKm) => {
    const dx = distanceKm * Math.cos(angle);
    const dy = distanceKm * Math.sin(angle);
    return [
      lat + dy / 111,
      lng + dx / (111 * Math.cos(lat * Math.PI / 180))
    ];
  };

  const waypoint = movePoint(startLat, startLng, angle, 0.2);

  return {
    id: Date.now() + Math.random(),
    lat: startLat,
    lng: startLng,
    homeLat: startLat,
    homeLng: startLng,
    route: [[startLat, startLng], waypoint],
    positionIdx: 0,
    takilaCode: takila.takilaCode,
    targetAlienId: targetAlien.id,
    fighterCode: `F${Math.floor(Math.random() * 1000)}`,
    phase: "exit",
    lastUpdated: Date.now()
  };
}

// ✅ ניהול תנועה מלא בשרת
setInterval(async () => {
  const now = Date.now();

  for (const t of takilas) {
    t.lastUpdated = now;
    if (t.showFightersOut) continue;
    if (t.route && t.positionIdx < t.route.length - 1) {
      t.positionIdx++;
      t.lat = t.route[t.positionIdx][0];
      t.lng = t.route[t.positionIdx][1];
    } else {
      const randomLat = t.lat + (Math.random() - 0.5) * 0.1;
      const randomLng = t.lng + (Math.random() - 0.5) * 0.1;
      const newRoute = await getRouteServer([t.lat, t.lng], [randomLat, randomLng]);
      t.route = newRoute;
      t.positionIdx = 0;
    }
  }

  for (const a of aliens) {
    if (a.route && a.positionIdx < a.route.length - 1) {
      a.positionIdx++;
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
    }
  }

  for (let i = fighters.length - 1; i >= 0; i--) {
    const f = fighters[i];

    if (!f.route || f.positionIdx === undefined) continue;

    if (f.phase === "exit" && f.positionIdx < f.route.length - 1) {
      f.positionIdx++;
      f.lat = f.route[f.positionIdx][0];
      f.lng = f.route[f.positionIdx][1];
    } else if (f.phase === "exit") {
      const target = aliens.find(a => a.id === f.targetAlienId);
      if (target && target.route) {
        f.route = [[f.lat, f.lng], target.route[target.positionIdx] || target.route[0]];
        f.positionIdx = 0;
        f.phase = "chase";
      } else {
        f.route = [[f.lat, f.lng], [f.homeLat, f.homeLng]];
        f.positionIdx = 0;
        f.phase = "return";
      }
    } else if (f.phase === "chase" && f.positionIdx < f.route.length - 1) {
      f.positionIdx++;
      f.lat = f.route[f.positionIdx][0];
      f.lng = f.route[f.positionIdx][1];
    } else if (f.phase === "chase") {
      f.route = [[f.lat, f.lng], [f.homeLat, f.homeLng]];
      f.positionIdx = 0;
      f.phase = "return";
    } else if (f.phase === "return" && f.positionIdx < f.route.length - 1) {
      f.positionIdx++;
      f.lat = f.route[f.positionIdx][0];
      f.lng = f.route[f.positionIdx][1];
    } else if (f.phase === "return") {
      fighters.splice(i, 1);
    }
  }

}, 1000);

// ✅ API Routes
app.get('/api/invasion', (req, res) => {
  const landingFeatures = landings.map(l => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [l.lng, l.lat] },
    properties: { id: l.id, createdAt: l.createdAt, type: "landing", locationName: l.locationName, landingCode: l.landingCode }
  }));

  const alienFeatures = aliens.map(a => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [a.route[a.positionIdx][1], a.route[a.positionIdx][0]] },
    properties: { id: a.id, landingId: a.landingId, type: "alien", alienCode: a.alienCode, route: a.route, positionIdx: a.positionIdx }
  }));

  const takilaFeatures = takilas.map(t => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [t.lng, t.lat] },
    properties: { id: t.id, type: "takila", takilaCode: t.takilaCode, route: t.route, positionIdx: t.positionIdx }
  }));

  const fighterFeatures = fighters.map(f => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [f.lng, f.lat] },
    properties: { id: f.id, type: "fighter", fighterCode: f.fighterCode, takilaCode: f.takilaCode, phase: f.phase, lastUpdated: f.lastUpdated }
  }));

  res.json({
    type: "FeatureCollection",
    features: [...landingFeatures, ...alienFeatures, ...takilaFeatures, ...fighterFeatures]
  });
});

app.post('/api/create-takila', async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  await createTakila(lat, lng);
  res.json({ message: "🚙 Takila created successfully." });
});

app.post('/api/create-alien', async (req, res) => {
  const { lat, lng, landingId, alienCode } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  await createAlien(lat, lng, landingId, alienCode);
  res.json({ message: "👽 Alien created successfully." });
});

app.post('/api/create-fighters', async (req, res) => {
  const { takilaId, targetAlienId } = req.body;
  const takila = takilas.find(t => t.id === takilaId);
  const targetAlien = aliens.find(a => a.id === targetAlienId);

  if (!takila || !targetAlien) {
    return res.status(400).json({ error: "Invalid takila or alien" });
  }

  const modes = ['forward', 'right', 'left', 'back'];
  const newFighters = modes.map(mode => createSingleFighter(takila, targetAlien, mode));
  fighters.push(...newFighters);
  takila.showFightersOut = true;

  res.json({ message: "🧍 Fighters created successfully." });
});

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.listen(PORT, () => {
  console.log(`🛡️ Server running on port ${PORT}`);
});
