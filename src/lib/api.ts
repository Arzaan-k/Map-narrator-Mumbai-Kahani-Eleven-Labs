
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

export async function generateAudio(text: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error("Failed to generate audio");
    return response.blob();
}
