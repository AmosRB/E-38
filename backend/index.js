
// ✅ index.js - מתוקן מלא כולל תנועה, ירי, פיצוצים ויצירת לוחמים תקינה

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
    phase: 'exit',
    lastUpdated: Date.now()
  };
}

setInterval(async () => {
  const now = Date.now();
  shots = [];
  explosions = [];
  const alienHitMap = {};

  for (const f of fighters) {
    f.lastUpdated = now;

    if (!f.route || f.route.length === 0) continue;
    const current = f.route[f.positionIdx];
    if (!current) continue;

    f.lat = current[0];
    f.lng = current[1];

    if (f.phase === 'exit') {
      f.positionIdx++;
      if (f.positionIdx >= f.route.length) {
        f.phase = 'chase';
        f.positionIdx = 0;
        const target = aliens.find(a => a.id === f.targetAlienId);
        f.route = target?.route || [[f.lat, f.lng]];
      }
    } else if (f.phase === 'chase') {
      f.positionIdx++;
      const target = aliens.find(a => a.id === f.targetAlienId);
      if (target && target.route) {
        const [aLat, aLng] = target.route[target.positionIdx] || target.route[0];
        const d = Math.sqrt((aLat - f.lat) ** 2 + (aLng - f.lng) ** 2) * 111;
        if (d < 0.3) {
          shots.push({ from: [f.lat, f.lng], to: [aLat, aLng] });
          alienHitMap[target.id] = (alienHitMap[target.id] || 0) + 1;
        }
      } else {
        f.phase = 'return';
        f.route = [[f.lat, f.lng], [f.homeLat, f.homeLng]];
        f.positionIdx = 0;
      }
    } else if (f.phase === 'return') {
      f.positionIdx++;
      if (f.positionIdx >= f.route.length) {
        const idx = fighters.findIndex(x => x.id === f.id);
        if (idx !== -1) fighters.splice(idx, 1);
        const t = takilas.find(t => t.takilaCode === f.takilaCode);
        if (t && !fighters.find(x => x.takilaCode === t.takilaCode)) {
          t.showFightersOut = false;
        }
      }
    }
  }

  for (const [aid, hits] of Object.entries(alienHitMap)) {
    if (hits >= 2) {
      const idx = aliens.findIndex(a => a.id == aid);
      if (idx !== -1) {
        const a = aliens[idx];
        const pos = a.route[a.positionIdx] || a.route[0];
        explosions.push({ lat: pos[0], lng: pos[1], type: 'explosion' });
        aliens.splice(idx, 1);
      }
    }
  }
}, 1000);

app.post('/api/create-fighters', async (req, res) => {
  const { takilaId, targetAlienId } = req.body;

  const takila = takilas.find(t => t.id === takilaId);
  const alien = aliens.find(a => a.id === targetAlienId);

  if (!takila || !alien) {
    return res.status(404).json({ error: 'Takila or alien not found' });
  }

  const modes = ['forward', 'back', 'left', 'right'];
  const newFighters = [];

  for (let i = 0; i < 4; i++) {
    const fighter = createSingleFighter(takila, alien, modes[i]);
    newFighters.push(fighter);
  }

  fighters.push(...newFighters);
  takila.showFightersOut = true;

  console.log(`✅ Fighters created for takila ${takila.id} targeting alien ${alien.id}`);

  res.status(201).json({ fighters: newFighters });
});

// רק כדוגמה: ניקוי כולל
app.delete('/api/clear-all', (req, res) => {
  landings = [];
  aliens = [];
  takilas = [];
  fighters = [];
  res.json({ message: '✅ All cleared' });
});

app.listen(PORT, () => console.log(`🛡️ Server running on port ${PORT}`));
