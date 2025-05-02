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

for (let i = 0; i < 8; i++) aliens.push({ id: i, lat: 32 + Math.random() * 0.01, lng: 34 + Math.random() * 0.01, hitCount: 0 });
takilas.push({ id: 100, lat: 32, lng: 34, status: 'WAITING', fightersCount: 4 });
landings.push({ id: 200, lat: 32.005, lng: 34.005, hitCount: 0 });
for (let i = 0; i < 4; i++) fighters.push({ id: 500 + i, lat: 32, lng: 34, takilaId: 100, targetId: aliens[i % aliens.length].id, phase: 'chase', isAlive: true });

setInterval(() => {
    shots = [];
    aliens.forEach(a => { a.lat += (Math.random() - 0.5) * 0.0005; a.lng += (Math.random() - 0.5) * 0.0005; });
    fighters.forEach(f => {
        if (!f.isAlive) return;
        const target = aliens.find(a => a.id === f.targetId);
        if (!target) return;
        const dx = target.lat - f.lat, dy = target.lng - f.lng, dist = Math.sqrt(dx * dx + dy * dy) * 111;
        f.lat += dx * 0.01; f.lng += dy * 0.01;
        if (dist < 0.3) { shots.push({ fromLat: f.lat, fromLng: f.lng, toLat: target.lat, toLng: target.lng, type: 'fighter' }); target.hitCount++; }
    });
    aliens.forEach(a => fighters.forEach(f => {
        const dx = a.lat - f.lat, dy = a.lng - f.lng, dist = Math.sqrt(dx * dx + dy * dy) * 111;
        if (dist < 0.2 && f.isAlive) {
            shots.push({ fromLat: a.lat, fromLng: a.lng, toLat: f.lat, toLng: f.lng, type: 'alien' });
            f.isAlive = false;
            takilas.find(t => t.id === f.takilaId).fightersCount--;
        }
    }));
    takilas.forEach(t => landings.forEach(l => {
        const dx = t.lat - l.lat, dy = t.lng - l.lng, dist = Math.sqrt(dx * dx + dy * dy) * 111;
        if (dist < 1.5) { shots.push({ fromLat: t.lat, fromLng: t.lng, toLat: l.lat, toLng: l.lng, type: 'takila' }); l.hitCount++; }
    }));
    aliens = aliens.filter(a => a.hitCount < 2);
    landings = landings.filter(l => l.hitCount < 4);
    takilas = takilas.filter(t => t.fightersCount > 0);
}, 1000);

// ✅ FIX: always return arrays even if empty
app.get('/api/snapshot', (req, res) => res.json({
    aliens: aliens || [],
    fighters: fighters || [],
    takilas: takilas || [],
    landings: landings || [],
    shots: shots || []
}));

app.post('/api/create-landing', (req, res) => {
    const id = Date.now();
    landings.push({ id, lat: 32 + Math.random() * 0.01, lng: 34 + Math.random() * 0.01, hitCount: 0 });
    for (let i = 0; i < 8; i++) aliens.push({ id: Date.now() + i, lat: 32 + Math.random() * 0.01, lng: 34 + Math.random() * 0.01, hitCount: 0 });
    res.json({ message: 'Landing created' });
});
app.post('/api/create-takila', (req, res) => {
    const id = Date.now();
    takilas.push({ id, lat: 32 + Math.random() * 0.01, lng: 34 + Math.random() * 0.01, status: 'WAITING', fightersCount: 4 });
    for (let i = 0; i < 4; i++) fighters.push({ id: Date.now() + i, lat: 32, lng: 34, takilaId: id, targetId: null, phase: 'exit', isAlive: true });
    res.json({ message: 'Takila created' });
});
app.delete('/api/clear-landings-aliens', (req, res) => { landings = []; aliens = []; res.json({ message: 'Cleared' }); });
app.delete('/api/clear-takilas-fighters', (req, res) => { takilas = []; fighters = []; res.json({ message: 'Cleared' }); });

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
