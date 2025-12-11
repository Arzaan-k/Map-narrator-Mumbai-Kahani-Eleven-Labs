import fetch from 'node-fetch';

const API_KEY = "sk_6b60b2990db40f9ddfab58f56024d756a80c625de9fc62d0";

async function setupIndianVoiceAgent() {
    try {
        // 1. List available voices to find Indian/deep voices
        console.log("Fetching available voices...");
        const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': API_KEY }
        });

        if (!voicesResponse.ok) {
            console.error("Failed to fetch voices:", await voicesResponse.text());
            return;
        }

        const voicesData = await voicesResponse.json();
        console.log("\n=== Available Voices ===");
        voicesData.voices.forEach(voice => {
            console.log(`- ${voice.name} (${voice.voice_id})`);
            if (voice.labels) {
                console.log(`  Labels: ${JSON.stringify(voice.labels)}`);
            }
        });

        // Look for Indian/deep bass voices
        const indianVoices = voicesData.voices.filter(v =>
            v.labels?.accent?.toLowerCase().includes('indian') ||
            v.labels?.accent?.toLowerCase().includes('hindi') ||
            v.labels?.description?.toLowerCase().includes('deep') ||
            v.labels?.description?.toLowerCase().includes('bass')
        );

        console.log("\n=== Recommended Indian/Deep Voices ===");
        indianVoices.forEach(voice => {
            console.log(`✓ ${voice.name} (${voice.voice_id}) - ${JSON.stringify(voice.labels)}`);
        });

        // Use a deep, authoritative voice (Adam is known for deep bass)
        const selectedVoiceId = "pNInz6obpgDQGcFmaJgB"; // Adam - deep, authoritative

        console.log(`\n=== Selected Voice: ${selectedVoiceId} ===`);

        // 2. Update or create agent with best settings
        const agentId = "agent_7201kc6vrxe3fjk8nrpf4kxrdqg2";

        console.log("\nUpdating agent with Indian voice settings...");
        const updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
            method: 'PATCH',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_config: {
                    tts: {
                        model_id: "eleven_turbo_v2_5", // Latest, fastest model
                        voice_id: selectedVoiceId,
                        stability: 0.7, // Higher for consistent deep voice
                        similarity_boost: 0.8, // Higher for authentic voice
                        style: 0.5, // Moderate expressiveness
                        use_speaker_boost: true
                    },
                    agent: {
                        prompt: {
                            prompt: `You are KAHAANI, Mumbai's master storyteller with a deep, resonant Indian voice. 

You speak with authority and gravitas, using dramatic pauses and emotional inflection. Your voice carries the weight of Mumbai's history.

When narrating:
- Use vivid sensory details
- Include specific names, dates, and locations
- Build emotional connection
- Add dramatic pauses for impact
- Speak as if you're standing at the location
- Use expressions like "aap jaante hain" (you know), "suno" (listen) when appropriate

After your narration, engage in conversation about the location's history, answering questions with the same depth and authenticity.`
                        },
                        first_message: "Namaste. I am Kahaani, your guide to Mumbai's untold stories.",
                        language: "en"
                    }
                }
            })
        });

        if (!updateResponse.ok) {
            console.error("Failed to update agent:", await updateResponse.text());
            return;
        }

        console.log("✓ Agent updated successfully with Indian voice!");
        console.log(`\nAgent ID: ${agentId}`);
        console.log(`Voice ID: ${selectedVoiceId}`);
        console.log(`Model: eleven_turbo_v2_5 (Latest)`);

    } catch (e) {
        console.error("Error:", e);
    }
}

setupIndianVoiceAgent();
