
import fetch from 'node-fetch';

const API_KEY = "sk_6b60b2990db40f9ddfab58f56024d756a80c625de9fc62d0";

async function getOrCreateAgent() {
    try {
        // 1. List Agents
        const listResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
            headers: { 'xi-api-key': API_KEY }
        });

        if (!listResponse.ok) {
            console.error("Failed to list agents:", await listResponse.text());
            return null;
        }

        const data = await listResponse.json();
        const existingAgent = data.agents?.find(a => a.name === "Mumbai Kahaani Storyteller");

        if (existingAgent) {
            console.log(existingAgent.agent_id);
            return;
        }

        // 2. Creates a simple agent if not found
        // We need a voice ID first. Let's use a standard one or fetch 'Rachel' as fallback.
        // For 'Indian' accent we might need to search, but for now let's use a known ID or default.
        // "21m00Tcm4TlvDq8ikWAM" is Rachel.

        const createResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
            method: 'POST',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Mumbai Kahaani Storyteller",
                conversation_config: {
                    tts: { model_id: "eleven_turbo_v2", voice_id: "21m00Tcm4TlvDq8ikWAM" },
                    agent: {
                        prompt: { prompt: "You are a storyteller. You will be given a script to read." },
                        first_message: "Hello",
                        language: "en"
                    }
                }
            })
        });

        if (!createResponse.ok) {
            // If creation API structure is complex/fails, we might just have to skip
            console.error("Failed to create agent:", await createResponse.text());
            return null;
        }

        const newAgent = await createResponse.json();
        console.log(newAgent.agent_id);

    } catch (e) {
        console.error("Error:", e);
    }
}

getOrCreateAgent();
