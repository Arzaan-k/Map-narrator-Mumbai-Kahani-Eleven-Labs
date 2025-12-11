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
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration
const corsOptions = {
    origin: isProduction
        ? true // Allow all origins in production (or specify your Render URL)
        : ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files in production
if (isProduction) {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));
    console.log('📦 Serving static files from:', distPath);
}

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
        dark: `Find THE SINGLE MOST FAMOUS AND WELL-KNOWN dark story about ${locationName}, Mumbai. What is the ONE crime, tragedy, ghost story, or incident that this place is MOST famous for? The story that locals know, that appears in news archives, that people search for online. ${dateContext}Include EVERY detail: all names, exact dates, what happened step-by-step, aftermath, why it's remembered. Make this ONE story comprehensive and detailed. Cite sources.`,

        bright: `Find THE SINGLE MOST FAMOUS AND CELEBRATED story about ${locationName}, Mumbai. What is the ONE achievement, landmark, famous person, or historical event that this place is MOST known for? The story that defines this location, that tourists want to hear. ${dateContext}Include EVERY detail: all names, exact dates, significance, impact, why it's famous, interesting facts. Make this ONE story comprehensive and detailed. Cite sources.`,

        both: `Find THE SINGLE MOST FAMOUS AND POPULAR story about ${locationName}, Mumbai. What is this place BEST KNOWN FOR? The ONE story that:
        - Appears most in searches and guidebooks
        - Locals tell visitors about
        - Defines this location's identity
        - Has the most historical documentation
        ${dateContext}
        Provide COMPLETE, DETAILED information about this ONE story: all names, exact dates, complete sequence of events, significance, impact, and why it remains famous today. Focus on DEPTH, not breadth. Cite all sources.`,
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
                    content: 'You are a historical researcher. Find THE SINGLE MOST FAMOUS story about the location. Provide ONLY verified, factual information with specific dates, names, and sources. Focus on the ONE story this place is best known for.'
                }, {
                    role: 'user',
                    content: prompts[storyMode] || prompts.both
                }],
                max_tokens: 4000,
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
        english: 'Write in pure English. Natural speech only - NO expression markers like *pauses* or [dramatic].',
        hindi: 'Write in pure Hindi (Devanagari script). Natural speech only - NO expression markers.',
        marathi: 'Write in pure Marathi (Devanagari script). Natural speech only - NO expression markers.',
        hinglish: `Write in NATURAL HINGLISH - authentic Mumbai street language mixing Hindi and English:
        - Use Hindi words naturally: yahan, wahan, kya, kaise, bahut, bada, purana, famous, khaas
        - Hindi expressions: "suniye", "dekhiye", "arre", "bas", "bilkul", "aur phir"
        - Keep verbs mostly English but add Hindi flavor: "dikha", "hua", "tha", "hai"
        - NO expression markers like *pauses* or [whispers]
        - Example tone: "Dekhiye, yeh jagah bahut famous hai. This place has a long history, jo ki bahut interesting hai."`
    };

    const voiceCharacteristics = {
        dramatic: 'Deep, resonant voice. The AI will add natural pauses and emphasis.',
        friendly: 'Warm, conversational tone. The AI will sound like a friend.',
        documentary: 'Authoritative, clear delivery. The AI will maintain professional tone.',
        mysterious: 'Low, atmospheric voice. The AI will create suspense naturally.'
    };

    const systemPrompt = `You are "KAHAANI" - Mumbai's master storyteller.

VOICE: ${voiceCharacteristics[voiceStyle]}
LANGUAGE: ${languageInstructions[language]}
MODE: ${storyMode === 'dark' ? 'Dark/Mysterious' : storyMode === 'bright' ? 'Inspiring' : 'Balanced'}
TIME: ${dateRange}

YOUR MISSION: Tell ONE SINGLE, COMPELLING STORY - focus on narrative, not details.

RULES:
1. Pick THE MOST FAMOUS story from the research
2. Tell it as an ENGAGING NARRATIVE - beginning, middle, end
3. Mention ONLY the most important names (2-3 key people maximum)
4. Skip minor details - focus on the STORY and EMOTION
5. Make it 2-3 minutes of narration (400-600 words)
6. Start with a powerful hook that draws listeners in
7. Build tension and drama throughout
8. Use vivid Mumbai sensory details (sounds, sights, atmosphere)
9. Write for natural SPOKEN narration like telling a friend
10. End with emotional impact or significance
11. Use Hinglish naturally - mix Hindi words smoothly
12. NEVER use expression markers like *pauses*, [dramatic], (whispers), etc.
13. Let the AI voice handle expressions naturally through the text itself`;

    const userPrompt = `Create ONE detailed, immersive narrative story about ${areaInfo.neighborhood}, Mumbai.

TIME PERIOD: ${dateRange}
NEARBY LANDMARKS: ${pois.map(p => p.name).join(', ')}

RESEARCH ABOUT THE MOST FAMOUS STORY:
${scrapedContent}

INSTRUCTIONS:
- Choose the SINGLE MOST FAMOUS/POPULAR story from the research above
- Tell it as an ENGAGING NARRATIVE focused on the story, not listing facts
- Mention ONLY 2-3 most important names (main characters/people)
- Skip minor dates and details - focus on DRAMA and EMOTION
- Make it conversational and gripping
- Length: 2-3 minutes when spoken (400-600 words)
- Write as if telling a fascinating story to a friend standing next to you
- Use natural Hinglish - sprinkle Hindi words throughout`;

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
                max_tokens: 4096,
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

        const script = data.content?.[0]?.text || 'Failed to generate script via Claude (Empty response).';
        
        // Print the generated story in terminal
        console.log('\n' + '═'.repeat(80));
        console.log('📖 GENERATED STORY:');
        console.log('═'.repeat(80));
        console.log(script);
        console.log('═'.repeat(80) + '\n');
        
        return script;
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

// Audio Narration Endpoint with ElevenLabs V3
app.post('/api/narrate', async (req, res) => {
    try {
        console.log('🎙️ [NARRATE] Request received');
        const { text, voiceId = 'EsGA6YZzJKyddqvfyQ26' } = req.body; // Kartik voice - natural Indian voice
        
        if (!text) {
            console.error('❌ [NARRATE] No text provided in request');
            return res.status(400).json({ error: 'Text is required' });
        }
        
        console.log('🎙️ [NARRATE] Text length:', text.length, 'Voice ID:', voiceId);
        
        if (!process.env.ELEVENLABS_API_KEY) {
            console.error('❌ [NARRATE] ElevenLabs API Key missing');
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }
        
        console.log('🎙️ [NARRATE] Calling ElevenLabs API with V3 model...');
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_turbo_v2_5', // Latest V3 model - more natural, supports multilingual
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5, // V3 feature for more expressive speech
                    use_speaker_boost: true // V3 feature for clarity
                }
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [NARRATE] ElevenLabs API error:', response.status, errorText);
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }
        
        console.log('✅ [NARRATE] Audio generated successfully with V3 model');
        const audioBuffer = await response.arrayBuffer();
        console.log('✅ [NARRATE] Audio buffer size:', audioBuffer.byteLength, 'bytes');
        
        res.set('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('❌ [NARRATE] Error:', error);
        res.status(500).json({ error: 'Failed to generate audio: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mumbai Kahaani Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   - POST /api/gather-data');
    console.log('   - POST /api/generate-script');
    console.log('   - POST /api/narrate (V3 Model)');
    console.log('');
    console.log('🔑 Environment variables check:');
    console.log('   - PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('   - ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('   - ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY ? '✅ Set' : '❌ Missing');
});
