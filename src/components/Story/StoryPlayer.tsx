import { useEffect, useState, useRef, useCallback } from 'react';
import { useConversation } from '@11labs/react';
import { useUser } from '@clerk/clerk-react';
import Visualizer from './Visualizer';
import { motion } from 'framer-motion';
import { X, Send, Mic, MicOff, BookmarkPlus, Volume2, VolumeX } from 'lucide-react';

interface StoryPlayerProps {
    location: any;
    storyData: any;
    onClose: () => void;
}

export default function StoryPlayer({ location, storyData, onClose }: StoryPlayerProps) {
    const { user } = useUser();
    const [transcript, setTranscript] = useState<string>('');
    const [phase, setPhase] = useState<'connecting' | 'live' | 'ended'>('connecting');
    const [textInput, setTextInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);

    // Build dynamic prompt
    const agentPrompt = `You are "KAHAANI" - Mumbai's legendary AI storyteller.

LOCATION: ${location.name}, Mumbai (${location.lat}, ${location.lng})
COVERAGE: 2km radius from this point

KNOWLEDGE BASE:
${storyData.scrapedContent || storyData.knowledgeBase || 'Historical information about ' + location.name}

NEARBY PLACES:
${storyData.pois?.slice(0, 8).map((p: any) => `• ${p.name}`).join('\n') || 'Various landmarks'}

USER PREFERENCES:
• Style: ${storyData.preferences?.storyMode || 'complete'}
• Era: ${storyData.preferences?.dateRange || 'all'}
• Language: ${storyData.preferences?.language || 'english'}
• Tone: ${storyData.preferences?.voiceStyle || 'dramatic'}

YOUR BEHAVIOR:
1. Tell continuous, engaging stories about ${location.name}
2. Be interruptible - answer questions when asked
3. Use ONLY verified facts from knowledge base
4. Include specific dates, names, and events
5. Create vivid imagery of Mumbai
6. ${storyData.preferences?.language === 'hinglish' ? 'Mix Hindi phrases naturally' : 'Speak clearly'}

RULES:
❌ No speculation or made-up facts
❌ No information beyond knowledge base
✅ Stay factual and engaging
✅ Reference specific details`;

    // ElevenLabs Conversational AI
    const conversation = useConversation({
        overrides: {
            agent: {
                prompt: { prompt: agentPrompt },
                firstMessage: `Namaste! Main hoon Kahaani. Welcome to ${location.name}! Let me share some fascinating stories about this place...`,
                language: storyData.preferences?.language === 'hindi' ? 'hi' : 'en'
            },
            tts: {
                voiceId: 'pNInz6obpgDQGcFmaJgB' // Adam - deep voice
            }
        },
        onConnect: () => {
            console.log('✓ Connected to ElevenLabs');
            setPhase('live');
            setTranscript(`🎙️ KAHAANI is LIVE\n━━━━━━━━━━━━━━━━━━━\n📍 ${location.name}\n\n`);
        },
        onDisconnect: () => {
            console.log('Disconnected');
            setPhase('ended');
        },
        onMessage: (message: any) => {
            const text = message.message || message.text || '';
            if (text) {
                const isUser = message.source === 'user' || message.type === 'user_transcript';
                setTranscript(prev => prev + `\n\n${isUser ? '👤 You' : '🎙️ KAHAANI'}:\n${text}`);
            }
        },
        onError: (error: any) => {
            console.error('Error:', error);
            setTranscript(prev => prev + `\n\n⚠️ ${error.message || 'Connection issue'}`);
        }
    });

    const { status, isSpeaking, sendUserMessage } = conversation;

    // Start conversation
    const startConversation = useCallback(async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

        if (!agentId || agentId.includes('here') || agentId.length < 10) {
            setTranscript(`🔧 Setup Required

To use the AI Storyteller, you need an ElevenLabs Agent:

1️⃣ Go to elevenlabs.io/app/conversational-ai
2️⃣ Create a new Agent
3️⃣ Copy the Agent ID
4️⃣ Add to .env.local:
   VITE_ELEVENLABS_AGENT_ID=your_id
5️⃣ Restart the app

Current value: ${agentId || 'not set'}`);
            setPhase('ended');
            return;
        }

        try {
            setTranscript(`🔄 Connecting to KAHAANI...

📍 Location: ${location.name}
🎭 Style: ${storyData.preferences?.voiceStyle || 'dramatic'}
🌐 Language: ${storyData.preferences?.language || 'english'}

Please allow microphone access...`);

            await navigator.mediaDevices.getUserMedia({ audio: true });

            await conversation.startSession({
                agentId,
                connectionType: 'webrtc'
            });

        } catch (error: any) {
            console.error('Connection failed:', error);
            setTranscript(`❌ Connection Failed

${error.message}

Check:
• Agent ID is correct
• Microphone is enabled
• ElevenLabs subscription is active`);
            setPhase('ended');
        }
    }, [conversation, location.name, storyData.preferences]);

    const handleSend = () => {
        if (!textInput.trim() || status !== 'connected') return;
        sendUserMessage(textInput);
        setTranscript(prev => prev + `\n\n👤 You:\n${textInput}`);
        setTextInput('');
    };

    const handleSave = () => {
        if (!user?.id) return;
        const saved = JSON.parse(localStorage.getItem(`stories_${user.id}`) || '[]');
        saved.push({
            location: location.name,
            preferences: storyData.preferences,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem(`stories_${user.id}`, JSON.stringify(saved));
        setIsSaved(true);
    };

    useEffect(() => {
        startConversation();
        return () => { conversation.endSession(); };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    useEffect(() => {
        conversation.setVolume({ volume });
    }, [volume]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 z-[1000] w-[420px] h-[680px] rounded-3xl overflow-hidden shadow-2xl"
        >
            {/* Abstract Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-fuchsia-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent" />

            {/* Animated Orbs */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-40 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Header */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' :
                                    phase === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'
                                }`} />
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">{location.name}</h2>
                                <p className="text-xs text-white/60">
                                    {status === 'connected' ? '🎙️ Live Conversation' :
                                        phase === 'connecting' ? '⏳ Connecting...' : '📍 Ended'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleSave}
                                className={`p-2.5 rounded-xl transition-all ${isSaved
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                            >
                                <BookmarkPlus size={18} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Visualizer */}
                <div className="flex justify-center py-4">
                    <div className="relative">
                        <Visualizer isPlaying={isSpeaking || status === 'connected'} />
                        {isSpeaking && (
                            <motion.div
                                className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 blur-xl"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        )}
                    </div>
                </div>

                {/* Transcript */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-light">
                        {transcript || '🎙️ Initializing KAHAANI...'}
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span className="text-white/60">
                                {status === 'connected' ? 'Connected • Speak naturally' : 'Waiting for connection...'}
                            </span>
                        </div>
                        {isSpeaking && (
                            <span className="text-cyan-400 animate-pulse">🎙️ Speaking...</span>
                        )}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={() => setVolume(v => v > 0 ? 0 : 0.8)} className="text-white/60 hover:text-white">
                            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400"
                        />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-3 rounded-xl transition-all ${isMuted
                                    ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                                    : 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                                }`}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a question..."
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!textInput.trim() || status !== 'connected'}
                            className="p-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-cyan-500/25"
                        >
                            <Send size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
