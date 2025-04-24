const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let landings = [];
let aliens = [];
const alienCounters = {}; // landingId -> index

// פונקציה לחישוב קוד נחיתה הבא (A → Z → AA → AB וכו')
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

// סינון ישויות לא פעילות
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
    || !a.alienCode // תמיכה אחורנית
  );
}, 5000);

// שליפת מצב כללי
app.get('/api/invasion', (req, res) => {
  const landingFeatures = landings.map(landing => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [landing.lng, landing.lat]
    },
    properties: {
      id: landing.id,
      createdAt: landing.createdAt,
      type: "landing",
      locationName: landing.locationName,
      landingCode: landing.landingCode
    }
  }));

  const alienFeatures = aliens.map(alien => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: alien.position,
    },
    properties: {
      id: alien.id,
      landingId: alien.landingId,
      type: "alien",
      alienCode: alien.alienCode
    }
  }));

  res.json({
    type: "FeatureCollection",
    features: [...landingFeatures, ...alienFeatures]
  });
});

// קבלת עדכונים מהלקוח
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

// חישוב מסלול
app.get('/api/route', async (req, res) => {
  const { fromLat, fromLng, toLat, toLng } = req.query;
  try {
    const routeRes = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=polyline`
    );
    res.json(routeRes.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🛰️ Server running on port ${PORT}`);
});


//גרסה שעוד לא עלתה לחלוקת זיהוי רק על ידי השרת