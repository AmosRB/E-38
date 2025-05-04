export async function fetchSnapshot() {
    try {
        const res = await fetch('/api/snapshot');
        const data = await res.json();

        return {
            aliens: Array.isArray(data.aliens) ? data.aliens : [],
            landings: Array.isArray(data.landings) ? data.landings : [],
            takilas: Array.isArray(data.takilas) ? data.takilas : [],
            fighters: Array.isArray(data.fighters) ? data.fighters : [],
            shots: Array.isArray(data.shots) ? data.shots : [],
        };
    } catch (error) {
        console.error('❌ Error fetching snapshot:', error);
        // מחזירים מבנה ריק במקרה של שגיאה, כדי שלא ישבור את האפליקציה
        return {
            aliens: [],
            landings: [],
            takilas: [],
            fighters: [],
            shots: [],
        };
    }
}

export async function clearAliensLandings() {
    try {
        await fetch('/api/clear-landings-aliens', { method: 'DELETE' });
    } catch (error) {
        console.error('❌ Error clearing aliens and landings:', error);
    }
}

export async function clearTakilasFighters() {
    try {
        await fetch('/api/clear-takilas-fighters', { method: 'DELETE' });
    } catch (error) {
        console.error('❌ Error clearing takilas and fighters:', error);
    }
}

export async function createLanding() {
    try {
        await fetch('/api/create-landing', { method: 'POST' });
    } catch (error) {
        console.error('❌ Error creating landing:', error);
    }
}

export async function createTakila() {
    try {
        await fetch('/api/create-takila', { method: 'POST' });
    } catch (error) {
        console.error('❌ Error creating takila:', error);
    }
}
