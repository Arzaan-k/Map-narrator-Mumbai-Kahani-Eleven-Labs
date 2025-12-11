import { useEffect, useState, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { useUser } from '@clerk/clerk-react';
import Visualizer from './Visualizer';
import { motion } from 'framer-motion';
import { X, BookmarkPlus, BookmarkCheck } from 'lucide-react';

interface StoryPlayerProps {
    location: any;
    storyData: any;
    onClose: () => void;
}

export default function StoryPlayer({ location, storyData, onClose }: StoryPlayerProps) {
    const [transcript, setTranscript] = useState<string>('');
    const [phase, setPhase] = useState<'connecting' | 'narrating' | 'conversing' | 'ended'>('connecting');
    const [isPlaying, setIsPlaying] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasStartedConversation = useRef(false);

    // Check if we're in conversation mode or podcast mode
    const isConversationMode = storyData.preferences?.mode === 'conversation';

    // ElevenLabs Conversational AI hook
    const conversation = useConversation({
        onConnect: () => {
            console.log('✓ Connected to ElevenLabs Conversational AI');
            setPhase('conversing');
            setIsPlaying(true);
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs Conversational AI');
            setIsPlaying(false);
        },
        onMessage: (message: any) => {
            console.log('Conversation message:', message);
            // Handle different message formats from ElevenLabs
            const text = message?.message?.text || message?.text || message?.message || '';
            if (text) {
                setTranscript(prev => {
                    const timestamp = new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    return prev + `\n\n[${timestamp}] 🎙️ KAHAANI:\n${text}`;
                });
            }
        },
        onError: (error: any) => {
            console.error('ElevenLabs conversation error:', error);
            setTranscript(prev => prev + '\n\n❌ Connection error. Check console for details.');
        },
    });

    // Play the narration using ElevenLabs TTS
    const playNarration = async () => {
        try {
            setPhase('narrating');
            setIsPlaying(true);

            // Show the script immediately
            setTranscript(storyData.script);

            const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_6b60b2990db40f9ddfab58f56024d756a80c625de9fc62d0';

            // Use multilingual voice for Hindi/Hinglish support
            const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam - deep bass, supports multilingual

            console.log('Generating audio with ElevenLabs v3 (alpha) - Multilingual Model...');
            console.log('Language:', storyData.preferences?.language);

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: storyData.script,
                    model_id: "eleven_multilingual_v2", // ElevenLabs v3 (alpha) - best for expressions and multilingual
                    voice_settings: {
                        stability: 0.5, // Lower for more dynamic expression in v3
                        similarity_boost: 0.75,
                        style: 0.0, // v3 handles style automatically
                        use_speaker_boost: true
                    },
                    // Enable multilingual mode for Hindi/Hinglish
                    language_code: storyData.preferences?.language === 'hindi' ? 'hi' :
                        storyData.preferences?.language === 'marathi' ? 'mr' :
                            storyData.preferences?.language === 'hinglish' ? 'hi' : 'en'
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
                console.log('✓ Podcast audio ended, transitioning to Q&A mode');
                setIsPlaying(false);
                setPhase('conversing');

                // Start Q&A session for follow-up questions after podcast
                startQAMode();
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

    // Start CONVERSATIONAL AGENT MODE (continuous talking + Q&A)
    const startConversationAgent = async () => {
        if (hasStartedConversation.current) {
            console.log('Conversation already started, skipping...');
            return;
        }

        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

        if (!agentId) {
            console.warn("No agent ID - conversation mode disabled");
            setTranscript('❌ Conversation mode requires VITE_ELEVENLABS_AGENT_ID in .env.local');
            setPhase('ended');
            return;
        }

        hasStartedConversation.current = true;

        try {
            console.log('🤖 Starting Conversational Agent for', location.name);

            const firstMessage = `Welcome to ${location.name}, Mumbai! I am Kahaani, your AI storyteller. I'll be sharing fascinating stories about this location and its surroundings. You can interrupt me anytime to ask questions!`;

            await conversation.startSession({
                agentId,
                overrides: {
                    agent: {
                        firstMessage: firstMessage, // Agent will start talking immediately
                        prompt: {
                            prompt: `You are "KAHAANI" - Mumbai's AI storytelling companion with a deep, engaging Indian voice.

LOCATION CONTEXT:
- Current Location: ${location.name}, Mumbai
- Coordinates: ${location.lat}, ${location.lng}
- You are covering this location and all points of interest within a 2km radius

KNOWLEDGE BASE (Research about ${location.name}):
${storyData.scrapedContent || 'Historical facts about ' + location.name}

POINTS OF INTEREST NEARBY:
${storyData.pois?.map((p: any) => `- ${p.name} (${p.type})`).join('\n') || 'Gathering POI data...'}

PREFERENCES:
- Story Mode: ${storyData.preferences?.storyMode || 'both'} (dark=crimes/mysteries, bright=achievements/culture, both=balanced)
- Time Period: ${storyData.preferences?.dateRange || 'all eras'}
- Language: ${storyData.preferences?.language || 'English'}
- Voice Style: ${storyData.preferences?.voiceStyle || 'dramatic'}

YOUR BEHAVIOR:
1. **Continuous Storytelling**: Keep telling engaging stories about ${location.name} and nearby places
2. **Interrupt-Friendly**: Stop and answer when user asks questions, then continue storytelling
3. **Location-Aware**: Focus on the ${location.name} area and 2km radius POIs
4. **Fact-Based**: Use ONLY verified information from the knowledge base
5. **Engaging**: Tell stories with vivid details, specific dates, names, and events
6. **Natural Flow**: Transition smoothly between stories and Q&A

STORYTELLING PATTERN:
- Start with ${location.name} overview
- Move through nearby POIs organically
- Share 2-3 minute stories about each place
- Include specific facts: dates, names, events
- Ask rhetorical questions to engage listener
- Maintain ${storyData.preferences?.voiceStyle || 'dramatic'} tone

WHEN USER ASKS QUESTIONS:
- Stop current story
- Answer directly using knowledge base
- Keep answers concise (30-45 seconds)
- After answering, ask if they want to hear more or continue the story

STRICT RULES:
❌ NO made-up facts or speculation
❌ NO information beyond knowledge base
✅ ONLY verified historical information
✅ Keep stories engaging and conversational`
                        }
                    }
                }
            });

            console.log("✓ Conversational Agent started");
            setTranscript(`🎙️ Live Conversation with KAHAANI\n━━━━━━━━━━━━━━━━━━━━━━\nExploring: ${location.name} + 2km radius\n\n`);

        } catch (error) {
            console.error('Failed to start conversational agent:', error);
            setTranscript('❌ Failed to start conversation mode. Error: ' + (error as Error).message);
            setPhase('ended');
            hasStartedConversation.current = false;
        }
    };

    // Start Q&A mode after podcast ends
    const startQAMode = async () => {
        if (hasStartedConversation.current) return;

        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
        if (!agentId) {
            setTranscript(prev => prev + '\n\n💬 Story complete! (Q&A requires agent ID)');
            setPhase('ended');
            return;
        }

        hasStartedConversation.current = true;

        try {
            await conversation.startSession({
                agentId,
                overrides: {
                    agent: {
                        firstMessage: "", // No auto-play for Q&A mode
                        prompt: {
                            prompt: `You are "KAHAANI" - Mumbai's storyteller. You just narrated a podcast about ${location.name}.

STORY YOU NARRATED:
${storyData.script}

KNOWLEDGE BASE:
${storyData.scrapedContent || 'Historical facts about ' + location.name}

YOUR ROLE: Answer questions about ${location.name} using ONLY the knowledge base above.

RULES:
- Keep answers brief (2-3 sentences)
- Reference specific facts from knowledge base
- If asked about something not in knowledge base: "I don't have verified information about that"
- Maintain conversational tone`
                        }
                    }
                }
            });

            setTranscript(prev => prev + '\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n💬 Podcast complete! Ask me questions about ' + location.name + '...');
        } catch (error) {
            console.error('Failed to start Q&A:', error);
        }
    };

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            if (isConversationMode) {
                // Conversation mode: Start conversational agent immediately
                console.log('🎭 Starting in CONVERSATION mode');
                startConversationAgent();
            } else {
                // Podcast mode: Play TTS narration
                console.log('🎙️ Starting in PODCAST mode');
                playNarration();
            }
        }

        return () => {
            mounted = false;
            // Cleanup audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            // End conversation session
            conversation.endSession();
        };
    }, []); // Empty deps array ensures this runs only once

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[1000] w-full max-w-[400px] h-[600px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden font-sans ring-1 ring-black/5"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 transition z-10">
                <X className="text-gray-500 hover:text-black transition-colors" />
            </button>

            <div className="flex flex-col h-full p-6 pt-12">
                <div className="text-center space-y-1 mb-6">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-100/80 border border-blue-200 text-[10px] font-mono text-blue-800 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-blue-600 animate-pulse' : phase === 'conversing' ? 'bg-green-600' : 'bg-gray-400'}`} />
                        {isConversationMode ? '💬 CONVERSATION' : phase === 'narrating' && isPlaying ? '🎙️ PODCAST' : phase.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{location.name}</h2>
                    <p className="text-slate-500 text-xs tracking-widest uppercase font-medium">
                        {storyData.preferences?.voiceStyle || 'Dramatic'} • {storyData.preferences?.dateRange || 'All Eras'}
                        {isConversationMode && ' • Live Agent'}
                    </p>
                </div>

                <div className="flex-1 w-full flex flex-col items-center min-h-0 relative">
                    <div className="scale-75 origin-center -my-4">
                        <Visualizer isPlaying={isPlaying} />
                    </div>

                    {/* Transcript Area */}
                    <div ref={scrollRef} className="w-full mt-4 flex-1 overflow-y-auto px-1 custom-scrollbar text-center">
                        <p className="text-base text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                            {transcript || "Preparing your story..."}
                        </p>
                    </div>
                </div>

                {(phase === 'conversing' || isConversationMode) && (
                    <div className="mt-4 p-3 bg-linear-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-bold text-green-900">
                                {isConversationMode ? 'LIVE CONVERSATION AGENT' : 'Q&A MODE'}
                            </p>
                        </div>
                        <p className="text-xs text-green-800 font-medium">
                            {isConversationMode
                                ? `🎙️ KAHAANI is telling stories about ${location.name}. Ask questions anytime!`
                                : `💬 Ask me anything about ${location.name}`}
                        </p>
                        <p className="text-[10px] text-green-700 mt-1">
                            {conversation.status === 'connected' ? '✓ Agent connected' : '⏳ Connecting...'}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
