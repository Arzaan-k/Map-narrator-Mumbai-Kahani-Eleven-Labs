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

        // Check if response is JSON (Overpass sometimes returns XML errors)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('Overpass API returned non-JSON response, using fallback');
            return [{ name: 'Historical Sites', type: 'landmark' }];
        }

        const data = await response.json();

        if (!data.elements || data.elements.length === 0) {
            return [{ name: 'Local landmarks', type: 'landmark' }];
        }

        return data.elements
            .filter(el => el.tags && el.tags.name)
            .slice(0, 15)
            .map(el => ({
                name: el.tags.name,
                type: el.tags.historic || el.tags.amenity || el.tags.tourism || 'landmark',
            }));
    } catch (error) {
        console.error('Overpass API error:', error.message);
        return [{ name: 'Mumbai landmarks', type: 'landmark' }];
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
        english: 'Write in pure English. Natural speech only - NO expression markers like *pauses* or [dramatic].',
        hindi: 'Write ENTIRELY in Hindi using Devanagari script (देवनागरी). Natural speech only - NO expression markers.',
        marathi: 'Write ENTIRELY in Marathi using Devanagari script (देवनागरी). Natural speech only - NO expression markers.',
        hinglish: `Write in Hinglish - a NATURAL mix of Hindi (देवनागरी) and English.
        
CRITICAL RULES FOR HINGLISH:
- Use Hindi words in Devanagari script: यह, वह, बहुत, जगह, कहानी, etc.
- Mix with English: "यह place बहुत important है"
- Use Hindi for emotions: दिल, प्यार, डर, खुशी
- Use Hindi for cultural terms: मंदिर, बाज़ार, चाय, रिक्शा
- Keep English for modern terms: station, building, police
- NO expression markers like *pauses* or [whispers]
- Write EXACTLY how a Mumbaikar speaks naturally

Example: "सुनो, यह Gateway of India सिर्फ एक monument नहीं है। यह Mumbai का दिल है, you know?"
`
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

CRITICAL RULES:
1. Use ONLY verified facts from research
2. Include specific names, dates, locations
3. NO fiction - only documented facts
4. Start with powerful hook
5. Use vivid Mumbai sensory details
6. Build emotional connection
7. Write for SPOKEN narration - natural speech patterns
8. ${language === 'hinglish' || language === 'hindi' || language === 'marathi' ? 'Use Devanagari script for Hindi/Marathi words' : 'Use English'}
9. NEVER use expression markers like *pauses*, [dramatic], (whispers), etc.
10. Let the AI voice handle expressions naturally through the text itself

NARRATION STYLE:
- Short, punchy sentences
- Natural speech rhythm
- Vary sentence length
- Use rhetorical questions
- Present tense for immediacy
- NO stage directions or expression markers`;

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

// ElevenLabs Conversational AI - Get Signed URL for secure sessions
app.get('/api/elevenlabs/signed-url', async (req, res) => {
    try {
        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
        const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID;

        if (!ELEVENLABS_API_KEY || !AGENT_ID) {
            return res.status(500).json({
                error: 'Missing ElevenLabs API key or Agent ID',
                required: ['ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID']
            });
        }

        console.log('🔑 Generating signed URL for ElevenLabs agent:', AGENT_ID);

        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
            {
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            return res.status(response.status).json({ error: 'Failed to get signed URL', details: errorText });
        }

        const data = await response.json();
        console.log('✓ Signed URL generated successfully');
        res.json({ signedUrl: data.signed_url });

    } catch (error) {
        console.error('Signed URL error:', error);
        res.status(500).json({ error: 'Failed to generate signed URL' });
    }
});

// ElevenLabs TTS - Generate audio from text
app.post('/api/elevenlabs/tts', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;

        if (!ELEVENLABS_API_KEY) {
            return res.status(500).json({ error: 'Missing ElevenLabs API key' });
        }

        console.log('🎙️ Generating TTS audio...');
        console.log('📝 Text length:', text.length, 'characters');

        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ ElevenLabs TTS error:', errorText);
            return res.status(response.status).json({ error: 'TTS generation failed', details: errorText });
        }

        const audioBuffer = await response.arrayBuffer();
        console.log('✓ Audio generated:', audioBuffer.byteLength, 'bytes');

        // Send audio directly
        res.set('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Failed to generate audio' });
    }
});

// Catch-all route - must be AFTER API routes
if (isProduction) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mumbai Kahaani Server running on port ${PORT}`);
    console.log(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`🔑 API Keys loaded: ${Object.keys(process.env).filter(k => k.includes('API_KEY')).length}`);
});
