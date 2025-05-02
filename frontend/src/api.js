// ✅ FIX: add error handling
export async function fetchSnapshot() {
    try {
        const res = await fetch('/api/snapshot');
        if (!res.ok) throw new Error('Failed to fetch snapshot');
        return await res.json();
    } catch (error) {
        console.error('Error fetching snapshot:', error);
        return { aliens: [], fighters: [], takilas: [], landings: [], shots: [] };
    }
}
