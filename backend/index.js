// ✅ index.js מתוקן לגמרי
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const polyline = require('polyline');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let landings = [];
let aliens = [];
let takilas = [];
let fighters = [];

const alienCounters = {}; // landingId -> index

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

  const takila = {
    id: Date.now(),
    lat,
    lng,
    speed: 60 / 3600,
    direction: Math.random() * 360,
    lastUpdated: Date.now(),
    route,
    positionIdx: 0
  };
  takilas.push(takila);
}

function getNextLandingCode(existingCodes) {
  const toNumber = code => code.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65 + 1), 0);
  const toCode = num => {
    let code = '';
    while (num > 0) {
      num--;
      code = String.fromCharCode((num % 26) + 65) + code;
      num = Math.floor(num / 26);
    }
    return code;
  };

  const validCodes = existingCodes.filter(c => /^[A-Z]+$/.test(c));
  if (validCodes.length === 0) return 'A';

  const maxCode = validCodes.reduce((a, b) => toNumber(a) > toNumber(b) ? a : b);
  return toCode(toNumber(maxCode) + 1);
}

// 🔄 תזוזת חייזרים וטקילות כל שנייה
setInterval(() => {
  const cutoff = Date.now() - 10000;
  const activeLandingIds = [];

  landings = landings.filter(l => {
    const active = l.lastUpdated && l.lastUpdated > cutoff;
    if (active) activeLandingIds.push(l.id);
    return active;
  });

  aliens = aliens.filter(a =>
    (activeLandingIds.includes(a.landingId) && a.lastUpdated > cutoff)
    || !a.alienCode
  );

  takilas.forEach(t => {
    const now = Date.now();
    const elapsedSeconds = (now - t.lastUpdated) / 1000;
    t.lastUpdated = now;

    if (t.route && t.positionIdx < t.route.length - 1) {
      t.positionIdx++;
      t.lat = t.route[t.positionIdx][0];
      t.lng = t.route[t.positionIdx][1];
    }
  });
}, 1000);

// 🔵 API לקבלת כל המידע
app.get('/api/invasion', (req, res) => {
  const landingFeatures = landings.map(landing => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [landing.lng, landing.lat] },
    properties: { id: landing.id, createdAt: landing.createdAt, type: "landing", locationName: landing.locationName, landingCode: landing.landingCode }
  }));

  const alienFeatures = aliens.map(alien => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: alien.position },
    properties: { id: alien.id, landingId: alien.landingId, type: "alien", alienCode: alien.alienCode }
  }));

  const takilaFeatures = takilas.map(t => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [t.lng, t.lat] },
    properties: { id: t.id, type: "takila", lastUpdated: t.lastUpdated, direction: t.direction }
  }));

  const fighterFeatures = fighters.map(f => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [f.lng, f.lat] },
    properties: { id: f.id, type: "fighter", lastUpdated: f.lastUpdated }
  }));

  res.json({
    type: "FeatureCollection",
    features: [...landingFeatures, ...alienFeatures, ...takilaFeatures, ...fighterFeatures]
  });
});

// 🛸 יצירת טקילה
app.post('/api/create-takila', async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  await createTakila(lat, lng);
  res.json({ message: "🚙 Takila created successfully." });
});

// 🔵 עדכון חייזרים ונחיתות
app.post('/api/update-invasion', (req, res) => {
  const { features } = req.body;
  const now = Date.now();

  const newLandings = features.filter(f => f.properties?.type === 'landing');
  const newAliens = features.filter(f => f.properties?.type === 'alien');

  newLandings.forEach(l => {
    const id = l.properties.id;
    const existing = landings.find(existing => existing.id === id);
    if (existing) {
      existing.lat = l.geometry.coordinates[1];
      existing.lng = l.geometry.coordinates[0];
      existing.locationName = l.properties.locationName || "Unknown";
      existing.lastUpdated = now;
    } else {
      const existingCodes = landings.map(l => l.landingCode);
      const landingCode = getNextLandingCode(existingCodes);
      landings.push({
        id,
        lat: l.geometry.coordinates[1],
        lng: l.geometry.coordinates[0],
        locationName: l.properties.locationName || "Unknown",
        createdAt: new Date().toISOString(),
        landingCode,
        lastUpdated: now
      });
      alienCounters[id] = 1;
    }
  });

  newAliens.forEach(a => {
    const pos = [a.geometry.coordinates[0], a.geometry.coordinates[1]];
    const id = a.properties.id;
    const landingId = a.properties.landingId ?? 0;
    const existing = aliens.find(existing => existing.id === id);
    if (existing) {
      existing.position = pos;
      existing.lastUpdated = now;
    } else {
      const landing = landings.find(l => l.id === landingId);
      const code = landing?.landingCode || "?";
      const index = alienCounters[landingId] || 1;
      const alienCode = `${code}${index}`;
      alienCounters[landingId] = index + 1;

      aliens.push({
        id,
        landingId,
        alienCode,
        position: pos,
        positionIdx: 0,
        lastUpdated: now
      });
    }
  });

  res.json({ message: "✅ invasion data updated (with server-side codes)" });
});

// 🧹 מחיקת הכל
app.delete('/api/invasion', (req, res) => {
  landings = [];
  aliens = [];
  takilas = [];
  fighters = [];
  res.json({ message: "🗑️ All invasion data deleted" });
});

// 🧹 מחיקת טקילות בלבד
app.delete('/api/takilas', (req, res) => {
  takilas = [];
  res.json({ message: "🗑️ All takilas deleted" });
});

app.listen(PORT, () => {
  console.log(`🛰️ Server running on port ${PORT}`);
});