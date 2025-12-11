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

<<<<<<< HEAD
    // Log environment variables on mount
    console.log('🔧 [INIT] Environment check:', {
        hasElevenLabsApiKey: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
        hasAgentId: !!import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID
    });

    // ElevenLabs Conversational AI hook (for follow-up questions)
=======
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
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
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
<<<<<<< HEAD
            console.log('✅ [CONVERSATION] Successfully connected to ElevenLabs Conversational AI');
            console.log('✅ [CONVERSATION] WebRTC connection established');
        },
        onDisconnect: () => {
            console.log('⚠️ [CONVERSATION] Disconnected from ElevenLabs');
        },
        onMessage: (message: any) => {
            console.log('📩 [CONVERSATION] Message received:', {
                type: typeof message,
                hasMessage: !!message?.message,
                hasText: !!message?.text,
                message: message
            });
            
            const text = message?.message || message?.text || '';
            if (text) {
                console.log('📩 [CONVERSATION] Extracted text:', text);
                if (phase === 'conversing') {
                    setTranscript(prev => prev + '\n\n🤖 ' + text);
                }
            } else {
                console.warn('⚠️ [CONVERSATION] Received message but no text found');
            }
        },
        onError: (error: any) => {
            console.error('❌ [CONVERSATION] Error occurred');
            console.error('❌ [CONVERSATION] Error details:', {
                type: error?.constructor?.name,
                message: error?.message,
                error: error
            });
        },
=======
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
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
    });

    const { status, isSpeaking, sendUserMessage } = conversation;

    // Start conversation
    const startConversation = useCallback(async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;

<<<<<<< HEAD
            const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_6b60b2990db40f9ddfab58f56024d756a80c625de9fc62d0';
            const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam - deep bass voice

            console.log('Generating audio with ElevenLabs TTS...');

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: storyData.script,
                    model_id: "eleven_turbo_v2_5",
                    voice_settings: {
                        stability: 0.7,
                        similarity_boost: 0.8,
                        style: 0.5,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create and play audio
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => {
                console.log('✓ Audio playing');
                setIsPlaying(true);
            };

            audio.onended = () => {
                console.log('✓ Audio ended, transitioning to conversation mode');
                setIsPlaying(false);
                setPhase('conversing');

                // Start conversational AI session for follow-up questions
                startConversationMode();
            };

            audio.onerror = (e) => {
                console.error('Audio playback error:', e);
                setIsPlaying(false);
                setPhase('ended');
            };

            await audio.play();

        } catch (error) {
            console.error('Failed to play narration:', error);
            setTranscript(prev => prev + '\n\n[Audio playback failed. Showing text only.]');
            setPhase('ended');
            setIsPlaying(false);
        }
    };

    // Start conversation mode for follow-up questions
    const startConversationMode = async () => {
        console.log('\n🔵 [CONVERSATION] Starting conversation mode...');
        
=======
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
        console.log('🔵 [CONVERSATION] Agent ID:', agentId ? `Found (${agentId})` : 'MISSING');

<<<<<<< HEAD
        if (!agentId) {
            console.error('❌ [CONVERSATION] No agent ID configured in environment');
            console.error('❌ [CONVERSATION] Set VITE_ELEVENLABS_AGENT_ID in .env file');
            setTranscript(prev => prev + '\n\n❌ Conversation mode disabled - Agent ID not configured.');
=======
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
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
            return;
        }

        try {
<<<<<<< HEAD
            console.log('🔵 [CONVERSATION] Preparing session config...');
            const sessionConfig = {
                agentId: String(agentId),
                connectionType: 'webrtc' as const,
                overrides: {
                    agent: {
                        prompt: {
                            prompt: `You are "KAHAANI" - Mumbai's storyteller with a deep Indian voice.

YOU JUST NARRATED THIS STORY:
${storyData.script}

KNOWLEDGE BASE:
${storyData.knowledgeBase || storyData.scrapedContent || 'Historical facts about ' + location.name}

LOCATION: ${location.name}, Mumbai
LANGUAGE: ${storyData.preferences?.language || 'English'}

RULES:
1. Answer ONLY using the knowledge base
2. NO speculation
3. Keep responses brief and engaging
4. Maintain deep Indian voice character
5. Reference specific facts from the knowledge base`
                        }
                    }
                }
            };
            
            console.log('🔵 [CONVERSATION] Session config:', JSON.stringify({
                agentId: sessionConfig.agentId,
                connectionType: sessionConfig.connectionType,
                hasOverrides: !!sessionConfig.overrides
            }, null, 2));

            console.log('🔵 [CONVERSATION] Calling conversation.startSession...');
            await conversation.startSession(sessionConfig);

            console.log('✅ [CONVERSATION] Session started successfully!');
            console.log('✅ [CONVERSATION] Conversation mode ready');
            setTranscript(prev => prev + '\n\n🎙️ You can now ask me questions about ' + location.name + '!');

        } catch (error: any) {
            console.error('❌ [CONVERSATION] Failed to start conversation');
            console.error('❌ [CONVERSATION] Error type:', error?.constructor?.name);
            console.error('❌ [CONVERSATION] Error message:', error?.message);
            console.error('❌ [CONVERSATION] Full error:', error);
            console.error('❌ [CONVERSATION] Error stack:', error?.stack);
            
            setTranscript(prev => prev + '\n\n❌ Conversation mode failed to start. Check console logs.');
=======
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
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
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
<<<<<<< HEAD
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[1000] w-full max-w-[500px] h-[75vh] max-h-[850px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/60 flex flex-col overflow-hidden font-sans ring-1 ring-black/5"
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

            <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition z-10 border border-slate-200">
                <X size={20} />
            </button>

            <div className="flex flex-col h-full p-8 pt-14">
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold font-mono text-indigo-700 mb-2 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-600 animate-pulse' : phase === 'conversing' ? 'bg-green-500' : 'bg-slate-400'}`} />
                        {phase === 'narrating' && isPlaying ? 'PLAYING NOW' : phase.toUpperCase()}
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">{location.name}</h2>
                    <p className="text-slate-500 text-sm tracking-widest uppercase font-semibold">
                        {storyData.preferences?.voiceStyle || 'Dramatic'} • {storyData.preferences?.dateRange || 'All Eras'}
                    </p>
                </div>

                <div className="flex-1 w-full flex flex-col items-center min-h-0 relative">
                    <div className="scale-90 origin-center -my-2 opacity-90">
                        <Visualizer isPlaying={isPlaying} />
                    </div>

                    {/* Transcript Area - Larger Font */}
                    <div ref={scrollRef} className="w-full mt-6 flex-1 overflow-y-auto px-2 custom-scrollbar text-center mask-linear-fade">
                        <p className="text-xl text-slate-700 leading-relaxed font-normal whitespace-pre-wrap font-sans">
                            {transcript || "Preparing your story..."}
                        </p>
                    </div>
                </div>

                {phase === 'conversing' && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl text-center shadow-inner">
                        <p className="text-base font-bold text-indigo-900">🎙️ Ask me anything about {location.name}!</p>
                        <p className="text-sm text-indigo-600 mt-1 font-medium">Use your microphone to ask questions</p>
=======
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
>>>>>>> 7d403f9f8433679e3c0aa811c074eafcde77130d
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
