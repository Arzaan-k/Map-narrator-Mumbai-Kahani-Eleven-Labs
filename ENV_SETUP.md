# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Backend API Keys (used by server/index.js)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Frontend Environment Variables (used by React/Vite)
VITE_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
```

## How to Get API Keys:

1. **Perplexity API Key**
   - Visit: https://www.perplexity.ai/settings/api
   - Sign up/login and generate an API key

2. **Anthropic API Key**
   - Visit: https://console.anthropic.com/
   - Sign up/login and generate an API key

3. **ElevenLabs API Key**
   - Visit: https://elevenlabs.io/app/settings/api-keys
   - Sign up/login and generate an API key

4. **ElevenLabs Agent ID**
   - Option 1: Run `node scripts/get-agent-id.js` to list your agents
   - Option 2: Create an agent at https://elevenlabs.io/app/conversational-ai
   - Copy the Agent ID

## After Setup:

1. Save the `.env.local` file
2. Restart both servers:
   - Backend: `npm run server`
   - Frontend: `npm run dev`
   - Or both: `npm start`

The server will show which API keys are properly configured when it starts.

