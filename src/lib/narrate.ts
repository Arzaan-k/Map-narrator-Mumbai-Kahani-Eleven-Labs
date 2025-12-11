
// Mocked endpoint for narrate (Text to Speech) since we don't have a backend server
// In a real Next.js app, this would be `api/narrate.ts`
// import { Location } from '../data/locations';

export async function narrateText(text: string, voiceId: string = "EsGA6YZzJKyddqvfyQ26") { // Kartik voice
    const apiKey = import.meta.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.warn("ElevenLabs API Key missing");
        return null;
    }

    // Use the standard TTS endpoint
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
            }
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate audio");
    }

    return response.blob();
}
