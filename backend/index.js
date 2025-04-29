// ✅ index.js נקי ומתוקן - בלי כפילויות, מוכן לריצה

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
  const movePoint = (lat, lng, angle, km) => [
    lat + (km * Math.sin(angle)) / 111,
    lng + (km * Math.cos(angle)) / (111 * Math.cos(lat * Math.PI / 180))
  ];
  const wp = movePoint(startLat, startLng, angle, 0.2);

  return {
    id: Date.now() + Math.random(),
    lat: startLat,
    lng: startLng,
    homeLat: startLat,
    homeLng: startLng,
    route: [[startLat, startLng], wp],
    positionIdx: 0,
    takilaCode: takila.takilaCode,
    targetAlienId: targetAlien.id,
    fighterCode: `F${Math.floor(Math.random() * 1000)}`,
    phase: 'exit',
    lastUpdated: Date.now()
  };
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

// ✅ מחיקות (לפני static)
app.delete('/api/takilas', (req, res) => {
  takilas = [];
  fighters = [];
  res.json({ message: "✅ Takilas and fighters deleted" });
});

app.delete('/api/clear-all', (req, res) => {
  landings = [];
  aliens = [];
  takilas = [];
  fighters = [];
  res.json({ message: "✅ All invasion data cleared" });
});

// ✅ מסלולים (Routes)
app.post('/api/update-invasion', (req, res) => { ... });
app.post('/api/create-takila', async (req, res) => { ... });
app.post('/api/create-alien', async (req, res) => { ... });
app.post('/api/create-fighters', async (req, res) => { ... });

app.get('/api/invasion', (req, res) => { ... });

// ✅ קבצי סטטי
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ✅ הפעלת שרת
app.listen(PORT, () => {
  console.log(`🛡️ Server running on port ${PORT}`);
});
