import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Load env vars
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- HELPER FUNCTIONS ---

// 1. Overpass API (POI Search)
async function findPOIsInRadius(lat, lng, radius = 2000) {
    const query = `
    [out:json][timeout:25];
    (
      node["historic"](around:${radius},${lat},${lng});
      node["amenity"="place_of_worship"](around:${radius},${lat},${lng});
      node["tourism"](around:${radius},${lat},${lng});
      node["building"]["name"](around:${radius},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const data = await response.json();
        return data.elements
            .filter(el => el.tags && el.tags.name)
            .slice(0, 15)
            .map(el => ({
                name: el.tags.name,
                type: el.tags.historic || el.tags.amenity || el.tags.tourism || 'landmark',
            }));
    } catch (error) {
        console.error('Overpass API error:', error);
        return [];
    }
}

// 2. Nominatim API (Reverse Geocoding)
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'MumbaiKahaani/1.0' } }
        );
        const data = await response.json();
        return {
            neighborhood: data.address?.suburb || data.address?.neighbourhood || 'Mumbai',
            area: data.address?.city_district || '',
            city: 'Mumbai',
        };
    } catch (error) {
        console.error('Nominatim error:', error);
        return { neighborhood: 'Mumbai', area: '', city: 'Mumbai' };
    }
}

// 3. Perplexity API (Web Search)
async function searchLocationInfo(locationName, storyMode, era) {
    if (!process.env.PERPLEXITY_API_KEY) {
        console.warn("Perplexity API Key missing, using fallback.");
        return `Detailed history of ${locationName} during the ${era} era.`;
    }

    const prompts = {
        dark: `Research ${locationName}, Mumbai crime history, ghost stories, mafia, scandals, tragedies. ${era !== 'all' ? `Focus on ${era} era.` : ''} Include specific names, dates, incidents.`,
        bright: `Research ${locationName}, Mumbai history, achievements, heritage, famous personalities, development. ${era !== 'all' ? `Focus on ${era} era.` : ''} Include specific facts and dates.`,
        both: `Research ${locationName}, Mumbai - both dark (crime, ghosts, scandals) and bright (history, achievements, heritage) aspects. ${era !== 'all' ? `Focus on ${era} era.` : ''} Cover both equally.`,
    };

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-large-128k-online',
                messages: [{ role: 'user', content: prompts[storyMode] || prompts.both }],
                max_tokens: 2500,
            }),
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        console.error('Perplexity API error:', error);
        return `History and stories of ${locationName}.`;
    }
}

// 4. Claude API (Script Generation)
async function generateWithClaude(scrapedContent, pois, areaInfo, preferences) {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn("Anthropic API Key missing, simulation mode.");
        return `Welcome to ${areaInfo.neighborhood}! This is a simulated script because the API key is missing. Imagine a dramatic story about ${pois.map(p => p.name).join(', ')}.`;
    }

    const { storyMode, era, voiceStyle, length, language } = preferences;

    const systemPrompt = `You are "KAHAANI" - Mumbai's master storyteller.
    Style: ${voiceStyle}
    Language: ${language}
    Mode: ${storyMode}
    Length: ${length}
    Era: ${era}
    
    RULES:
    1. Write ONLY narration.
    2. Start with a hook.
    3. Use provided research.
    4. Speak naturally.`;

    const userPrompt = `Create a story about ${areaInfo.neighborhood}.
    POIs: ${pois.map(p => p.name).join(', ')}
    Research: ${scrapedContent}`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5 Sonnet (Oct 2024)
                max_tokens: 2500,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Claude API Error Details:', JSON.stringify(data, null, 2));
            return `Story generation error: ${data.error?.message || 'Unknown error'}`;
        }

        return data.content?.[0]?.text || 'Failed to generate script via Claude (Empty response).';
    } catch (error) {
        console.error('Claude API Request Failed:', error);
        return 'Critical error generating script.';
    }
}

// --- ENDPOINTS ---

app.post('/api/gather-data', async (req, res) => {
    try {
        const { lat, lng, locationName, storyMode, era } = req.body;
        console.log(`Gathering data for ${locationName}...`);

        const [pois, areaInfo, reverseGeo] = await Promise.all([
            findPOIsInRadius(lat, lng),
            reverseGeocode(lat, lng),
            // We call Perplexity inside a later step or parallel here if we had the name
            // For now, let's assume locationName is passed efficiently
        ]);

        // Refine location name if needed
        const refinedName = areaInfo.neighborhood || locationName;

        const scrapedContent = await searchLocationInfo(refinedName, storyMode, era);

        res.json({
            pois,
            areaInfo,
            scrapedContent,
            location: { lat, lng, name: refinedName }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to gather data" });
    }
});

app.post('/api/generate-script', async (req, res) => {
    try {
        const { scrapedContent, pois, areaInfo, preferences } = req.body;
        const script = await generateWithClaude(scrapedContent, pois, areaInfo, preferences);
        res.json({ script, location: areaInfo.neighborhood, preferences });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate script" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mumbai Kahaani Server running on http://localhost:${PORT}`);
});
