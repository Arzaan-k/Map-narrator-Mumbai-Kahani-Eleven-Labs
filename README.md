# Mumbai Kahaani - AI-Powered Location Storytelling

An immersive full-stack application that brings Mumbai's stories to life through AI-powered narration and conversation.

## 🌟 Features

- **Interactive Map**: Click anywhere in Mumbai to discover stories within a 2km radius
- **AI Storytelling**: Powered by Claude 3.5 Sonnet for rich, contextual narratives
- **Voice Narration**: ElevenLabs Conversational AI for natural speech and follow-up questions
- **Real-time Data**: Integrates Overpass API, Nominatim, and Perplexity for location context
- **Seamless UX**: Beautiful popup player that doesn't interrupt the map experience
- **Dual Modes**: Choose between Podcast-style narration or Interactive conversation

## 🚀 Tech Stack

### Frontend
- **React** + **Vite** - Fast, modern development
- **Tailwind CSS v4** - Utility-first styling
- **React Leaflet** - Interactive maps
- **Framer Motion** - Smooth animations
- **@11labs/react** - ElevenLabs integration

### Backend
- **Node.js** + **Express** - API server
- **Claude 3.5 Sonnet** - Script generation
- **ElevenLabs** - Voice synthesis & conversation
- **Perplexity API** - Real-time web research
- **Overpass API** - Points of interest
- **Nominatim** - Reverse geocoding

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs.git
cd Map-narrator-Mumbai-Kahani-Eleven-Labs
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
```env
VITE_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Getting API Keys

- **ElevenLabs**: [elevenlabs.io](https://elevenlabs.io) - Sign up and create a Conversational AI agent
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) - Get Claude API access
- **Perplexity**: [perplexity.ai](https://www.perplexity.ai/hub/api) - API access for web search

4. **Run the application**
```bash
npm start
```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎮 Usage

1. **Select a Location**: Click on any location in Mumbai on the map
2. **Customize Your Story**: Choose story mode (Dark/Bright), era, narrator style, and language
3. **Start the Experience**: Click "Begin the Journey"
4. **Listen & Interact**: Hear the AI narration and ask follow-up questions

## 📁 Project Structure

```
Map-narrator-Mumbai-Kahani-Eleven-Labs/
├── src/
│   ├── components/
│   │   ├── Map/           # Map components
│   │   └── Story/         # Story player & customizer
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & API clients
│   └── App.tsx            # Main application
├── server/
│   └── index.js           # Express backend server
├── scripts/
│   └── get-agent-id.js    # ElevenLabs agent setup
└── package.json
```

## 🛠️ Development

- **Frontend only**: `npm run dev`
- **Backend only**: `npm run server`
- **Both**: `npm start`

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The `vercel.json` configuration handles both frontend and serverless backend deployment.

## 🎨 Customization

- **Map Locations**: Edit `src/components/Map/WorldMap.tsx`
- **Story Prompts**: Modify `server/index.js` Claude prompts
- **UI Styling**: Update Tailwind classes in components

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with ❤️ for Mumbai
- Powered by ElevenLabs, Anthropic Claude, and Perplexity
- Map data © OpenStreetMap contributors

## 🐛 Issues

Found a bug? [Open an issue](https://github.com/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs/issues)

## 🤝 Contributing

Contributions welcome! Please open a PR.
