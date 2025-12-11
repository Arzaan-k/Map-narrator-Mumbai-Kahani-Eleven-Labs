# 🎙️ Mumbai Kahaani - AI-Powered Interactive Storytelling

> **Transform Mumbai's map into a living, breathing storybook powered by cutting-edge AI**

Mumbai Kahaani is an immersive full-stack web application that revolutionizes how we experience urban history. By combining real-time geospatial data, AI-powered research, and natural language generation with voice synthesis, we've created an intelligent storytelling companion that brings Mumbai's rich heritage to life—one location at a time.

**🏆 Hackathon Project** | **Built with Claude Sonnet 4.5, ElevenLabs, and Perplexity AI**

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-blue?style=for-the-badge)](https://your-render-url.onrender.com)
[![Video Demo](https://img.shields.io/badge/📹-Video%20Demo-red?style=for-the-badge)](https://youtube.com/your-demo)
[![Documentation](https://img.shields.io/badge/📚-Docs-green?style=for-the-badge)](./DEPLOYMENT.md)

---

## 📖 Table of Contents

- [The Problem](#-the-problem-we-solve)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Technical Architecture](#-technical-architecture)
- [How It Works](#-how-it-works)
- [Innovation Highlights](#-innovation-highlights)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Integration](#-api-integration-details)
- [Deployment](#-deployment)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)

---

## 🎯 The Problem We Solve

**Urban history is dying in the digital age.** While we have GPS coordinates for every street corner, we're losing the stories, memories, and cultural heritage that make cities truly alive. Traditional audio guides are:

- ❌ Static and pre-recorded (can't answer questions)
- ❌ Limited to tourist hotspots (miss hidden gems)
- ❌ One-size-fits-all (no personalization)
- ❌ Outdated (information becomes stale)
- ❌ Non-interactive (passive listening only)

**Mumbai Kahaani changes this entirely.**

---

## 💡 Our Solution

Mumbai Kahaani is an **AI-powered location intelligence platform** that:

✅ **Generates fresh, verified content** on-demand for ANY location in Mumbai
✅ **Adapts to user preferences** (language, era, narrative style)
✅ **Enables two-way conversations** with an AI that knows local history
✅ **Covers 2km radius automatically** around any clicked point
✅ **Speaks naturally** in English, Hindi, Marathi, or Hinglish
✅ **Sources facts in real-time** from multiple APIs and research databases

---

## 🌟 Key Features

### 1. **Intelligent Location Detection**
- Click anywhere on Mumbai's interactive map
- Automatically identifies location via reverse geocoding (Nominatim API)
- Discovers all Points of Interest (POIs) within 2km radius (Overpass API)
- Contextualizes with neighborhood, district, and historical significance

### 2. **AI-Powered Research & Script Generation**
- **Perplexity AI** conducts real-time web research on the location
- Gathers verified historical facts, dates, names, events
- **Claude Sonnet 4.5** synthesizes this into engaging narratives
- Adapts tone based on user preferences (dark/bright/balanced)
- Includes specific time periods (1600-1800, British Raj, Post-Independence, etc.)

### 3. **Dual Interaction Modes**

#### 🎙️ Podcast Mode (TTS Narration)
- Generates a complete 2-3 minute narration script
- ElevenLabs Multilingual TTS converts text to natural speech
- Supports Hindi, English, Marathi, and Hinglish with Devanagari script
- Plays like a professional podcast with deep Indian voice
- Transitions to Q&A mode after narration for follow-up questions

#### 💬 Conversation Mode (Live AI Agent)
- **ElevenLabs Conversational AI** starts talking immediately
- Continuously tells stories about the location + 2km radius
- **Interrupt-friendly**: Ask questions anytime, agent stops and answers
- Returns to storytelling naturally after responding
- Fully voice-interactive with microphone support
- Context-aware: Remembers the conversation and location data

### 4. **Multi-Language Support**
- **English**: Pure English narration
- **Hindi**: Full Devanagari script (देवनागरी)
- **Marathi**: Full Devanagari script
- **Hinglish**: Natural Mumbai-style mix of Hindi and English
  - Example: *"सुनो, यह Gateway of India सिर्फ एक monument नहीं है। यह Mumbai का दिल है, you know?"*

### 5. **Customizable Story Experience**

**Narrative Lens:**
- 🌑 **Shadows** (Dark): Crimes, mysteries, tragedies, scandals
- 🌟 **Lights** (Bright): Achievements, heroes, cultural milestones
- 🔀 **Complete**: Balanced view of both light and shadow

**Time Periods:**
- Colonial Era (1600-1800)
- British Raj (1800-1900)
- Freedom Struggle (1900-1947)
- Post-Independence (1947-1980)
- Modern Mumbai (1980-2000)
- Contemporary (2000-Present)
- All Eras (Complete Timeline)

**Voice Styles:**
- Dramatic (Theatrical storyteller)
- Friendly (Warm local guide)
- Documentary (Authoritative narrator)
- Mysterious (Whispered secrets)

### 6. **User Authentication & Personalization** (Optional)
- Clerk authentication integration
- Save favorite stories
- Track listening history
- Personalized recommendations

### 7. **Production-Ready Deployment**
- One-click deploy to Render
- Environment-aware (dev/prod)
- Optimized build process
- Comprehensive documentation

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Leaflet Map  │  │Story Player  │  │ Customizer   │      │
│  │  Component   │  │   Component  │  │   Component  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑ API Calls
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express Server)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/gather-data → Collects location info           │  │
│  │  /api/generate-script → Creates narration            │  │
│  │  /api/elevenlabs/signed-url → Agent auth             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
       ↓                ↓               ↓              ↓
┌───────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────┐
│ Overpass  │  │   Nominatim  │  │Perplexity │  │  Claude  │
│    API    │  │   (OSM API)  │  │    AI     │  │Sonnet 4.5│
│   (POIs)  │  │  (Geocoding) │  │ (Research)│  │ (Script) │
└───────────┘  └──────────────┘  └───────────┘  └──────────┘
                                                      ↓
                                          ┌────────────────────┐
                                          │   ElevenLabs       │
                                          │  - TTS (Podcast)   │
                                          │  - Agent (Convo)   │
                                          └────────────────────┘
```

### Data Flow

**Step 1: User Interaction**
```
User clicks location → Frontend captures coordinates → Sends to backend
```

**Step 2: Data Gathering** (Parallel API calls)
```
Backend → Overpass API: Get POIs within 2km
       → Nominatim API: Reverse geocode (get area name)
       → Perplexity API: Research location history with user preferences
```

**Step 3: AI Script Generation**
```
Collected Data → Claude Sonnet 4.5 → Generates engaging narrative
                                   → Returns 500-800 word script
```

**Step 4: Voice Synthesis & Delivery**

**Podcast Mode:**
```
Script → ElevenLabs TTS API → Audio file → Frontend plays
      → After audio ends → Conversation Agent (Q&A mode)
```

**Conversation Mode:**
```
Location + Research → ElevenLabs Conversational Agent
                   → Agent starts talking about location
                   → User can interrupt with questions
                   → Agent responds and continues
```

---

## 🚀 Tech Stack

### **Frontend Technologies**
| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **React 18** | UI Framework | Component reusability, hooks for state management |
| **TypeScript** | Type Safety | Catch errors early, better IDE support |
| **Vite** | Build Tool | Lightning-fast HMR, optimized production builds |
| **Tailwind CSS v4** | Styling | Utility-first, rapid UI development |
| **React Leaflet** | Interactive Maps | Open-source, customizable, OSM integration |
| **Framer Motion** | Animations | Smooth transitions, gesture support |
| **@11labs/react** | Voice AI SDK | Official ElevenLabs React integration |
| **Clerk** | Authentication | Secure, easy-to-integrate auth solution |

### **Backend Technologies**
| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Node.js** | Runtime | JavaScript everywhere, async I/O |
| **Express.js** | Web Framework | Minimal, flexible, widely adopted |
| **dotenv** | Config Management | Secure environment variables |
| **node-fetch** | HTTP Client | Native fetch API for Node.js |
| **CORS** | Cross-Origin | Secure API access from frontend |

### **AI & ML Services**
| Service | Purpose | Key Features |
|---------|---------|--------------|
| **Claude Sonnet 4.5** (Anthropic) | Script Generation | - Latest frontier model (Jan 2025)<br>- 200K context window<br>- Superior reasoning & creativity<br>- Multi-language support<br>- Factual accuracy |
| **Perplexity AI** | Web Research | - Real-time internet access<br>- Verified sources<br>- Citation support<br>- Sonar models for accuracy |
| **ElevenLabs TTS** | Text-to-Speech | - Multilingual v2 model<br>- Natural prosody<br>- Hindi/Hinglish support<br>- Voice cloning quality |
| **ElevenLabs Conversational AI** | Live Voice Agent | - WebRTC for real-time<br>- Interrupt handling<br>- Context retention<br>- Custom prompts |

### **Geospatial & Data APIs**
| API | Purpose | Data Provided |
|-----|---------|---------------|
| **Overpass API** | POI Discovery | Historic sites, temples, landmarks, buildings |
| **Nominatim (OSM)** | Reverse Geocoding | Neighborhood, district, city names |
| **OpenStreetMap** | Base Map | Tiles, streets, geography |

### **Deployment & DevOps**
- **Render**: Web service hosting (auto-deploy from GitHub)
- **Git & GitHub**: Version control and CI/CD
- **npm**: Package management
- **ESLint**: Code linting and quality

---

## 🔬 How It Works

### Scenario: User clicks on "Gateway of India"

1. **Location Selection** (Frontend)
   - User clicks coordinates: `18.9220, 72.8347`
   - Map captures lat/lng and sends to backend

2. **Data Collection** (Backend - Parallel Execution)
   ```javascript
   Promise.all([
     findPOIsInRadius(18.9220, 72.8347, 2000),  // Overpass
     reverseGeocode(18.9220, 72.8347),           // Nominatim
     searchLocationInfo("Gateway of India", preferences) // Perplexity
   ])
   ```
   **Results:**
   - **POIs**: Taj Mahal Palace, Colaba Causeway, Elephanta Caves ferry point, etc.
   - **Area Info**: Colaba, South Mumbai, Maharashtra
   - **Research**: "Built in 1924 to commemorate King George V's visit... first structure visitors saw arriving by sea... witnessed India's independence..."

3. **AI Script Generation** (Claude Sonnet 4.5)
   ```
   Input: Location data + POIs + Research + User preferences
   Processing: Claude analyzes context, weaves narrative, adds local flavor
   Output: 650-word engaging script with specific dates, names, emotions
   ```

4. **Voice Synthesis**

   **Podcast Mode:**
   ```javascript
   ElevenLabs TTS API
   → Voice: Adam (deep bass, Indian accent)
   → Model: eleven_multilingual_v2
   → Language: Hinglish
   → Output: MP3 audio file
   → Frontend: Plays with visualizer
   ```

   **Conversation Mode:**
   ```javascript
   ElevenLabs Conversational Agent
   → Agent ID: Custom trained agent
   → Prompt: Dynamic based on location
   → Connection: WebRTC real-time
   → Behavior: Continuous storytelling + Q&A
   ```

5. **User Interaction**
   - Podcast: Listen → Audio ends → Ask questions
   - Conversation: Agent talks → User interrupts → Agent answers → Continues

---

## 💡 Innovation Highlights

### 🎯 What Makes This Unique

1. **Dynamic Content Generation**: Unlike static audio guides, every story is generated fresh based on latest research

2. **Contextual Intelligence**: Claude Sonnet 4.5 understands:
   - Relationship between location and nearby POIs
   - Historical context and time periods
   - User's language and cultural preferences
   - Narrative structure for spoken word

3. **Bilingual AI**: Seamless code-switching in Hinglish mode
   - Automatically uses Devanagari for cultural terms
   - English for modern concepts
   - Natural Mumbai dialect

4. **Interrupt-Friendly Conversations**: ElevenLabs agent can:
   - Detect user speech mid-sentence
   - Stop immediately
   - Answer question contextually
   - Resume storytelling naturally

5. **Fact-Based Storytelling**: Perplexity AI ensures:
   - All facts are verified from web sources
   - Citations and references
   - No hallucinations or speculation
   - Real historical accuracy

6. **Production-Grade Architecture**:
   - Environment-aware (dev/prod configs)
   - Optimized API usage (parallel calls)
   - Error handling and fallbacks
   - Scalable deployment on Render

---

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
npm run dev
```

This starts both frontend (Vite) and backend (Express) servers concurrently:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**Production mode**:
```bash
npm run build  # Build frontend
npm start      # Start production server
```

---

## 🎮 Usage Guide

### Quick Start

1. **Open the Application**
   - Navigate to the deployed URL or `http://localhost:5173`
   - Mumbai map loads with interactive pins

2. **Select a Location**
   - Click anywhere on the map
   - A popup appears showing the location name

3. **Customize Your Experience**

   **Choose Narrative Lens:**
   - 🌑 Shadows: Dark history (crimes, mysteries)
   - 🌟 Lights: Bright stories (achievements, culture)
   - 🔀 Complete: Balanced perspective

   **Select Time Period:**
   - Any era from 1600s to present
   - Or "All Eras" for complete timeline

   **Pick Language:**
   - English, Hindi, Marathi, or Hinglish
   - Hinglish uses Devanagari + English mix

   **Choose Voice Style:**
   - Dramatic, Friendly, Documentary, or Mysterious

   **Select Mode:**
   - 🎙️ **Podcast**: Pre-generated narration
   - 💬 **Conversation**: Live AI agent

4. **Click "Begin the Journey"**

5. **Experience the Story**

   **In Podcast Mode:**
   - Script generates (5-10 seconds)
   - Audio plays with visualizer
   - Read transcript while listening
   - Ask questions after completion

   **In Conversation Mode:**
   - Agent connects (2-3 seconds)
   - Starts talking about location
   - Interrupt anytime: "What about [topic]?"
   - Agent answers and continues

### Advanced Features

**Save Stories** (with authentication):
- Click bookmark icon
- Access later from profile
- Build personal collection

**Ask Follow-Up Questions:**
- "Tell me more about [person/event]"
- "What happened in [specific year]?"
- "Why is this place significant?"
- "Were there any famous people here?"

**Text Input** (Conversation mode):
- Type questions if mic unavailable
- Click Send or press Enter
- Agent responds via voice

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

---

## 🔌 API Integration Details

### Claude Sonnet 4.5 (Anthropic)

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Request:**
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 3000,
  "temperature": 0.7,
  "system": "You are KAHAANI - Mumbai's storyteller...",
  "messages": [
    {
      "role": "user",
      "content": "Create narration about Gateway of India..."
    }
  ]
}
```

**Why Claude Sonnet 4.5:**
- Latest model (Jan 2025 release)
- Best-in-class reasoning
- 200K context window for long research
- Multi-language support
- Factual accuracy

**Prompt Engineering:**
- System prompt defines character (KAHAANI)
- User prompt includes research data
- Temperature 0.7 for creativity + consistency
- Max tokens 3000 for detailed stories

---

### Perplexity AI (Web Research)

**Endpoint:** `https://api.perplexity.ai/chat/completions`

**Request:**
```json
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "You are a historical researcher. Provide ONLY verified facts..."
    },
    {
      "role": "user",
      "content": "Research Gateway of India, Mumbai - crimes, events, dates..."
    }
  ],
  "temperature": 0.2
}
```

**Why Perplexity:**
- Real-time internet access
- Cites sources
- Sonar models for accuracy
- Up-to-date information

**Research Modes:**
- Dark: Crimes, mysteries, tragedies
- Bright: Achievements, culture, heroes
- Both: Comprehensive balanced research

---

### ElevenLabs TTS

**Endpoint:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

**Request:**
```json
{
  "text": "सुनो, यह Gateway of India...",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

**Voice:** Adam (pNInz6obpgDQGcFmaJgB) - Deep bass, Indian accent

**Why This Voice:**
- Professional narrator quality
- Deep, resonant tone
- Suitable for dramatic storytelling
- Multilingual support (Hindi/English)

---

### ElevenLabs Conversational AI

**Connection:** WebRTC + Signed URL

**Workflow:**
1. Backend generates signed URL
2. Frontend connects via `@11labs/react`
3. WebRTC establishes real-time audio
4. Agent uses dynamic prompt with location context

**Dynamic Prompt:**
```
You are KAHAANI at {location}

KNOWLEDGE BASE:
{perplexity_research}

POIs NEARBY:
{overpass_pois}

BEHAVIOR:
- Tell stories continuously
- Answer when interrupted
- Use only knowledge base
- Maintain voice style
```

**Key Features:**
- Real-time bidirectional audio
- Interrupt detection
- Context retention
- Natural conversation flow

---

### Overpass API (POI Discovery)

**Endpoint:** `https://overpass-api.de/api/interpreter`

**Query:**
```
[out:json][timeout:25];
(
  node["historic"](around:2000,18.9220,72.8347);
  node["amenity"="place_of_worship"](around:2000,18.9220,72.8347);
  node["tourism"](around:2000,18.9220,72.8347);
  node["building"]["name"](around:2000,18.9220,72.8347);
);
out body;
```

**Returns:** All POIs within 2km radius with tags

---

### Nominatim (Reverse Geocoding)

**Endpoint:** `https://nominatim.openstreetmap.org/reverse`

**Parameters:**
```
lat=18.9220&lon=72.8347&format=json
```

**Returns:**
```json
{
  "address": {
    "suburb": "Colaba",
    "city_district": "Mumbai City",
    "city": "Mumbai"
  }
}
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development (runs both frontend + backend)
npm run dev

# Frontend only (Vite dev server)
npm run dev:client

# Backend only (Express server)
npm run dev:server

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Development Workflow

1. **Start both servers:**
   ```bash
   npm run dev
   ```
   - Backend: `http://localhost:3001`
   - Frontend: `http://localhost:5173`

2. **Make changes:**
   - Frontend: Auto-reloads (HMR)
   - Backend: Manual restart (or use nodemon)

3. **Test APIs:**
   - Use browser or Postman
   - Check console logs
   - Verify API keys in `.env.local`

4. **Build and test production:**
   ```bash
   npm run build
   npm start
   ```
   - Serves from `dist` folder
   - Tests production configuration

## 🌐 Deployment

### Render (Recommended)

This app is configured for easy deployment on Render:

1. Push to GitHub
2. Create Web Service on [Render](https://render.com)
3. Connect repository
4. Add environment variables (see below)
5. Deploy!

**📖 Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

### Environment Variables for Production

Add these in Render dashboard:

```bash
NODE_ENV=production
ANTHROPIC_API_KEY=sk-ant-xxxxx
PERPLEXITY_API_KEY=pplx-xxxxx
VITE_ELEVENLABS_API_KEY=sk_xxxxx
VITE_ELEVENLABS_AGENT_ID=agent_xxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Optional
```

---

## 🚢 Deployment

### Deploy to Render (Recommended)

**One-Click Deploy:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**Manual Deploy Steps:**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Render auto-detects `render.yaml`

3. **Configure Environment Variables**

   Add in Render dashboard:
   ```bash
   NODE_ENV=production
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   PERPLEXITY_API_KEY=pplx-xxxxx
   VITE_ELEVENLABS_API_KEY=sk_xxxxx
   VITE_ELEVENLABS_AGENT_ID=agent_xxxxx
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Optional
   ```

4. **Deploy!**
   - Render builds: `npm install && npm run build`
   - Starts: `node server/index.js`
   - Live at: `https://your-app.onrender.com`

**📖 Complete Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Cost Estimate (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| **Render** (Hosting) | ✅ 750 hrs/month | $0 |
| **Anthropic** (Claude) | ❌ Pay-as-you-go | $10-30 |
| **Perplexity** | ✅ Limited | $5-15 |
| **ElevenLabs** (TTS) | ✅ 10k chars | $5 |
| **ElevenLabs** (Agent) | ❌ | $11/month |
| **Total** | - | **$31-61/month** |

*Based on moderate usage (~100 stories/day)*

---

## 🎨 Customization Guide

### Adding New Locations

Edit `src/data/locations.ts`:
```typescript
export const mumbaiLocations = [
  {
    id: 'gateway-of-india',
    name: 'Gateway of India',
    lat: 18.9220,
    lng: 72.8347,
    description: 'Iconic archway monument built in 1924',
    category: 'historical'
  },
  // Add your location
];
```

### Modifying Claude Prompts

Edit `server/index.js` (lines 158-183):
```javascript
const systemPrompt = `You are "KAHAANI"...

CRITICAL RULES:
1. Use ONLY verified facts
2. Include specific names and dates
3. Start with powerful hook
// Add your custom rules
`;
```

### Changing Voice Settings

Edit `src/components/Story/StoryPlayer.tsx` (lines 198-203):
```typescript
voice_settings: {
  stability: 0.5,        // Higher = more consistent
  similarity_boost: 0.75, // Higher = closer to original voice
  style: 0.0,            // Expressiveness (for some models)
  use_speaker_boost: true // Enhances clarity
}
```

### Styling the UI

All styles use Tailwind CSS. Example:
```tsx
<div className="bg-slate-900 text-white p-4 rounded-xl">
  {/* Your content */}
</div>
```

---

## 🚀 Future Roadmap

### Phase 1: Enhanced Features (Q2 2025)
- [ ] **More Cities**: Expand to Delhi, Bangalore, Kolkata
- [ ] **AR Mode**: Overlay historical images on camera view
- [ ] **Guided Tours**: Multi-location curated experiences
- [ ] **Social Sharing**: Share stories on social media
- [ ] **Offline Mode**: Download stories for offline listening

### Phase 2: AI Enhancements (Q3 2025)
- [ ] **Image Generation**: Create historical visualizations with DALL-E
- [ ] **Video Summaries**: Generate short video clips
- [ ] **Custom Voices**: Train voices of historical figures
- [ ] **Emotion Detection**: Adapt narrative based on user sentiment
- [ ] **Multi-Agent System**: Multiple AI personas discuss location

### Phase 3: Community Features (Q4 2025)
- [ ] **User Submissions**: Let locals add their stories
- [ ] **Fact Verification**: Community voting on accuracy
- [ ] **Storyteller Leaderboard**: Gamification
- [ ] **Live Events**: Virtual walking tours with guide
- [ ] **API for Developers**: Open API for third-party apps

### Phase 4: Platform Expansion (2026)
- [ ] **Mobile Apps**: iOS & Android native apps
- [ ] **Smart City Integration**: Partner with Mumbai municipal corp
- [ ] **Tourism Partnerships**: Integrate with tour operators
- [ ] **Educational Use**: Schools and universities
- [ ] **Multilingual Expansion**: 20+ languages

---

## 🏆 Hackathon Achievements

### Technical Highlights
✅ **Cutting-Edge AI Stack**
- Claude Sonnet 4.5 (latest model, Jan 2025)
- ElevenLabs Conversational AI (real-time voice)
- Perplexity Sonar (real-time research)

✅ **Production-Ready**
- Deployed on Render
- Environment configurations
- Error handling & fallbacks
- Comprehensive documentation

✅ **User Experience**
- Intuitive UI/UX
- Smooth animations
- Responsive design
- Accessibility features

✅ **Innovation**
- First AI storytelling map for Mumbai
- Bilingual conversation AI
- Dynamic content generation
- Interrupt-friendly voice agent

### Metrics (if tested)
- 🎯 User Satisfaction: X%
- ⚡ Average Load Time: X seconds
- 🗣️ Languages Supported: 4
- 📍 Locations Covered: Unlimited
- 🎙️ Stories Generated: X
- 💬 Conversations Held: X

---

## 👥 Team

**Built by:**
- **[Your Name]** - Full-Stack Developer, AI Integration
- **[Team Member 2]** - Frontend Developer, UX Design *(if applicable)*
- **[Team Member 3]** - Backend Developer, API Integration *(if applicable)*

**Contact:**
- 📧 Email: your.email@example.com
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)
- 💼 LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- 🌐 Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Services
- **Anthropic Claude** - [Terms of Service](https://www.anthropic.com/legal/consumer-terms)
- **ElevenLabs** - [Terms of Use](https://elevenlabs.io/terms)
- **Perplexity AI** - [Terms](https://www.perplexity.ai/hub/terms-conditions)
- **OpenStreetMap** - [ODbL License](https://www.openstreetmap.org/copyright)

---

## 🙏 Acknowledgments

- **Mumbai's Rich Heritage** - Inspired by the city's incredible history
- **Claude Sonnet 4.5** (Anthropic) - For bringing stories to life
- **ElevenLabs** - For natural voice synthesis and conversational AI
- **Perplexity AI** - For real-time verified research
- **OpenStreetMap** Contributors - For map data
- **React & Vite Teams** - For amazing developer experience
- **Hackathon Organizers** - For the opportunity to build this

---

## 🐛 Issues & Support

Found a bug or have a suggestion?

1. **Check existing issues**: [GitHub Issues](https://github.com/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs/issues)
2. **Open a new issue**: Provide details, screenshots, and steps to reproduce
3. **Join discussions**: [GitHub Discussions](https://github.com/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs/discussions)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

**Contribution Areas:**
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🌍 Translations
- 🧪 Tests

---

## ⭐ Star History

If you find this project interesting, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs&type=Date)](https://star-history.com/#Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs&Date)

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs)
![License](https://img.shields.io/github/license/Arzaan-k/Map-narrator-Mumbai-Kahani-Eleven-Labs)

---

<div align="center">

## 🎙️ Experience Mumbai Like Never Before

**[🚀 Try Live Demo](https://your-app.onrender.com)** | **[📖 Read Docs](./DEPLOYMENT.md)** | **[🎥 Watch Video](https://youtube.com/your-demo)**

Made with ❤️ in Mumbai using Claude Sonnet 4.5

*"Every street has a story. Every corner has a memory. Let Mumbai speak to you."*

</div>
