
// Client-side API handler that talks to our Express Backend

const API_BASE = import.meta.env.MODE === 'production'
    ? '/api' // In production, API is served from same domain
    : 'http://localhost:3001/api'; // In development, use separate port

export async function gatherData(location: any, preferences: any) {
    const response = await fetch(`${API_BASE}/gather-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lat: location.lat,
            lng: location.lng,
            locationName: location.name,
            storyMode: preferences.storyMode,
            dateRange: preferences.dateRange,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to gather location data');
    }

    return response.json();
}

export async function generateScript(data: any, preferences: any) {
    const response = await fetch(`${API_BASE}/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            scrapedContent: data.scrapedContent,
            pois: data.pois,
            areaInfo: data.areaInfo,
            preferences,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate script');
    }

    return response.json();
}

<<<<<<< HEAD
export async function generateAudio(text: string, voiceId: string = 'EsGA6YZzJKyddqvfyQ26'): Promise<Blob> {
    const response = await fetch('http://localhost:3001/api/narrate', {
=======
export async function generateAudio(text: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/narrate`, {
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }) // Send Kartik voice ID
    });

    if (!response.ok) throw new Error("Failed to generate audio");
    return response.blob();
}
