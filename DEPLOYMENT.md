# Mumbai Kahaani - Deployment Guide for Render

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub account with this repository
- Render account (free tier works)
- Required API keys (see below)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select this repository: `Map-narrator-Mumbai-Kahani-Eleven-Labs`

### Step 3: Configure Build Settings

Render will auto-detect from `render.yaml`, but verify these settings:

- **Name**: `mumbai-kahaani` (or your choice)
- **Region**: Oregon (or closest to you)
- **Branch**: `main`
- **Root Directory**: leave blank
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server/index.js`
- **Plan**: Free

### Step 4: Set Environment Variables

Go to the **Environment** tab and add these variables:

#### Required Variables

| Variable Name | Description | Where to Get |
|---------------|-------------|--------------|
| `NODE_ENV` | Set to `production` | Manual value |
| `ANTHROPIC_API_KEY` | Claude API key for script generation | [Anthropic Console](https://console.anthropic.com/) |
| `PERPLEXITY_API_KEY` | Perplexity API for location research | [Perplexity Settings](https://www.perplexity.ai/settings/api) |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API for TTS | [ElevenLabs API Keys](https://elevenlabs.io/app/settings/api-keys) |
| `VITE_ELEVENLABS_AGENT_ID` | ElevenLabs Conversational Agent ID | [ElevenLabs Agents](https://elevenlabs.io/app/conversational-ai) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth (optional) | [Clerk Dashboard](https://dashboard.clerk.com/) |

#### How to Add Environment Variables on Render:

1. Go to your service dashboard
2. Click **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Enter Key and Value
5. Click **"Save Changes"**

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build the frontend (Vite)
   - Start the Node.js server
   - Serve the app

3. Monitor the build logs in real-time
4. Once deployed, you'll get a URL like: `https://mumbai-kahaani.onrender.com`

---

## 🔑 Getting Your API Keys

### 1. Anthropic API Key (Claude Sonnet 4.5)

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)
6. Add to Render as `ANTHROPIC_API_KEY`

**Pricing**: Pay as you go (~$3 per million input tokens)

### 2. Perplexity API Key

1. Go to [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Sign in
3. Generate new API key
4. Copy the key (starts with `pplx-...`)
5. Add to Render as `PERPLEXITY_API_KEY`

**Pricing**: Free tier available, then pay as you go

### 3. ElevenLabs API Key & Agent ID

#### API Key:
1. Go to [elevenlabs.io](https://elevenlabs.io/)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Create or copy existing key
5. Add to Render as `VITE_ELEVENLABS_API_KEY`

#### Agent ID (for Conversation Mode):
1. Go to [Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Create a new agent or select existing
3. Configure the agent:
   - **Name**: Mumbai Kahaani Storyteller
   - **Voice**: Choose a deep Indian voice (e.g., Adam)
   - **First Message**: Leave empty (handled by app)
   - **System Prompt**: Leave empty (app provides dynamic prompts)
4. Copy the **Agent ID** from the agent settings
5. Add to Render as `VITE_ELEVENLABS_AGENT_ID`

**Pricing**: Free tier includes 10k characters/month

### 4. Clerk Authentication (Optional)

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com/)
2. Create a new application
3. Copy the **Publishable Key**
4. Add to Render as `VITE_CLERK_PUBLISHABLE_KEY`

---

## 🛠️ Post-Deployment Configuration

### Update ElevenLabs Agent (if using Conversation mode)

After deployment, update your ElevenLabs agent settings:

1. Go to your agent in [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Add your Render URL to **Allowed Origins**:
   ```
   https://your-app-name.onrender.com
   ```

### Test Your Deployment

1. Visit your Render URL
2. Click on a location on the Mumbai map
3. Test both modes:
   - **🎙️ Podcast Mode**: Should generate and play narration
   - **💬 Conversation Mode**: Should start conversational agent

### Monitor Logs

View logs in real-time:
```
Render Dashboard → Your Service → Logs
```

---

## 📊 Expected Costs (Monthly)

| Service | Free Tier | Estimated Cost (Light Usage) |
|---------|-----------|------------------------------|
| Render (Hosting) | ✅ Free tier available | $0 |
| Anthropic (Claude) | ❌ Pay-as-you-go | $5-20 (depends on usage) |
| Perplexity | ✅ Free tier | $0-10 |
| ElevenLabs | ✅ 10k chars/month free | $0-5 (TTS) + $11/month (Agent) |
| **Total** | - | **$16-46/month** |

---

## 🐛 Troubleshooting

### Build Fails

**Error: `Cannot find module`**
- Solution: Check `package.json` has all dependencies
- Run locally: `npm install && npm run build`

**Error: TypeScript compilation errors**
- Solution: Fix TypeScript errors locally first
- Run: `npm run build` locally

### API Errors in Production

**Error: `API key missing`**
- Check environment variables are set in Render
- Variable names must match exactly (case-sensitive)
- For frontend vars, prefix with `VITE_`

**Error: CORS issues**
- The app is configured to allow all origins in production
- Check `server/index.js` CORS settings

### Audio Not Playing

**Podcast mode works but no sound:**
- Check `VITE_ELEVENLABS_API_KEY` is set
- Check browser console for errors
- Verify ElevenLabs API key has credits

**Conversation mode not working:**
- Check `VITE_ELEVENLABS_AGENT_ID` is set correctly
- Verify agent exists in ElevenLabs dashboard
- Check agent is not paused/disabled

### Performance Issues

**App loads slowly:**
- Render free tier "spins down" after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid plan for always-on service

---

## 🔄 Updating Your Deployment

### Method 1: Auto-Deploy (Recommended)

Enable auto-deploy in Render:
1. Go to **Settings** → **Build & Deploy**
2. Enable **Auto-Deploy**
3. Now every push to `main` triggers a new deployment

### Method 2: Manual Deploy

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

Then in Render dashboard:
- Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📝 Environment Variables Template

Create a `.env.local` file locally (DO NOT commit):

```bash
# Server-side API Keys
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Client-side API Keys (exposed to browser, safe for public)
VITE_ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx

# Environment
NODE_ENV=development
```

For Render, add these same variables in the dashboard (without `VITE_` prefix for server vars).

---

## ✅ Deployment Checklist

- [ ] All API keys obtained
- [ ] Repository pushed to GitHub
- [ ] Render web service created
- [ ] Environment variables configured
- [ ] Build completed successfully
- [ ] Application accessible via Render URL
- [ ] Map loads and locations are visible
- [ ] Podcast mode works (TTS audio plays)
- [ ] Conversation mode works (agent responds)
- [ ] No console errors in browser

---

## 🆘 Support

If you encounter issues:

1. Check Render logs for server errors
2. Check browser console for client errors
3. Verify all environment variables are set
4. Test API keys individually
5. Check service status pages:
   - [Anthropic Status](https://status.anthropic.com/)
   - [ElevenLabs Status](https://status.elevenlabs.io/)
   - [Render Status](https://status.render.com/)

---

## 🎉 Success!

Your Mumbai Kahaani app is now live! Share your Render URL:

```
https://your-app-name.onrender.com
```

Enjoy exploring Mumbai's stories! 🇮🇳
