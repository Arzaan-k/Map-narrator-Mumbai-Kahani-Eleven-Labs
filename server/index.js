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

// 3. Perplexity API (Web Search) - Ultra-Realistic Fact-Based Research
async function searchLocationInfo(locationName, storyMode, dateRange) {
    if (!process.env.PERPLEXITY_API_KEY) {
        console.warn("Perplexity API Key missing, using fallback.");
        return `Detailed factual history of ${locationName} during ${dateRange}.`;
    }

    const dateContext = dateRange !== 'all' ? `Focus exclusively on the period ${dateRange}. ` : '';

    const prompts = {
        dark: `Research ${locationName}, Mumbai - ONLY VERIFIED FACTS about: crimes, murders, gang wars, mafia activities, scandals, tragedies, ghost stories, accidents, riots, corruption cases. ${dateContext}Include: specific names of criminals/victims, exact dates, police case numbers if available, newspaper references, death tolls, locations of incidents. NO speculation or fiction. Cite sources.`,

        bright: `Research ${locationName}, Mumbai - ONLY VERIFIED FACTS about: historical achievements, cultural landmarks, famous personalities who lived/worked there, architectural heritage, independence movement activities, social reforms, economic development, festivals, art movements. ${dateContext}Include: specific names, exact dates, building names, achievement details, awards, historical significance. NO speculation. Cite sources.`,

        both: `Research ${locationName}, Mumbai - COMPREHENSIVE FACTUAL HISTORY covering BOTH:
        1. DARK SIDE: Verified crimes, tragedies, scandals, riots, accidents with specific names, dates, case details
        2. BRIGHT SIDE: Verified achievements, heritage, famous residents, cultural significance, development milestones
        ${dateContext}
        For EACH fact: provide specific names, exact dates, locations, and source references. Balance both aspects equally. NO fiction or speculation. Only documented historical facts.`,
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
                messages: [{
                    role: 'system',
                    content: 'You are a historical researcher. Provide ONLY verified, factual information with specific dates, names, and sources. No speculation or creative writing.'
                }, {
                    role: 'user',
                    content: prompts[storyMode] || prompts.both
                }],
                max_tokens: 3000,
                temperature: 0.2, // Low temperature for factual accuracy
            }),
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        console.error('Perplexity API error:', error);
        return `Factual history and documented events of ${locationName}.`;
    }
}

// 4. Claude API (Script Generation)
async function generateWithClaude(scrapedContent, pois, areaInfo, preferences) {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn("Anthropic API Key missing, simulation mode.");
        return `Welcome to ${areaInfo.neighborhood}! This is a simulated script because the API key is missing. Imagine a dramatic story about ${pois.map(p => p.name).join(', ')}.`;
    }

    const { storyMode, dateRange, voiceStyle, length, language } = preferences;

    const languageInstructions = {
        english: 'Write in pure English.',
        hindi: 'Write in pure Hindi (Devanagari script).',
        marathi: 'Write in pure Marathi (Devanagari script).',
        hinglish: 'Write in Hinglish - natural mix of Hindi and English as spoken in Mumbai.'
    };

    const voiceCharacteristics = {
        dramatic: 'Deep, resonant Indian voice with theatrical pauses. Heavy bass tone.',
        friendly: 'Warm, conversational Mumbai local voice. Like a friend sharing stories.',
        documentary: 'Authoritative Indian narrator voice. Clear, precise, factual delivery.',
        mysterious: 'Low, whispered Indian voice with suspenseful pauses.'
    };

    const systemPrompt = `You are "KAHAANI" - Mumbai's master storyteller with a deep, heavy-bass Indian voice.

VOICE: ${voiceCharacteristics[voiceStyle]}
LANGUAGE: ${languageInstructions[language]}
MODE: ${storyMode === 'dark' ? 'Dark/Mysterious' : storyMode === 'bright' ? 'Inspiring' : 'Balanced'}
TIME: ${dateRange}

RULES:
1. Use ONLY verified facts from research
2. Include specific names, dates, locations
3. NO fiction - only documented facts
4. Start with powerful hook
5. Use vivid Mumbai sensory details
6. Build emotional connection
7. Write for SPOKEN narration
8. Add Hinglish expressions if language is hinglish`;

    const userPrompt = `Create ultra-realistic narration about ${areaInfo.neighborhood}, Mumbai.

TIME PERIOD: ${dateRange}
POIs: ${pois.map(p => p.name).join(', ')}

VERIFIED RESEARCH:
${scrapedContent}

Use ONLY facts above. Include names and dates. Make it powerful for heavy Indian voice.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 3000,
                temperature: 0.7,
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
        const { lat, lng, locationName, storyMode, dateRange } = req.body;
        console.log(`Gathering data for ${locationName}...`);

        const [pois, areaInfo, reverseGeo] = await Promise.all([
            findPOIsInRadius(lat, lng),
            reverseGeocode(lat, lng),
            // We call Perplexity inside a later step or parallel here if we had the name
            // For now, let's assume locationName is passed efficiently
        ]);

        // Refine location name if needed
        const refinedName = areaInfo.neighborhood || locationName;

        const scrapedContent = await searchLocationInfo(refinedName, storyMode, dateRange);

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
