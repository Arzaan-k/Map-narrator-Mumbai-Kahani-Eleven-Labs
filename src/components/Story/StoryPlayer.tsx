import { useEffect, useState, useRef } from 'react';
import { useConversation } from '@11labs/react';
import Visualizer from './Visualizer';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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

    // Log environment variables on mount
    console.log('🔧 [INIT] Environment check:', {
        hasElevenLabsApiKey: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
        hasAgentId: !!import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID
    });

    // ElevenLabs Conversational AI hook (for follow-up questions)
    const conversation = useConversation({
        onConnect: () => {
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
    });

    // Play the narration using ElevenLabs TTS
    const playNarration = async () => {
        try {
            setPhase('narrating');
            setIsPlaying(true);

            // Show the script immediately
            setTranscript(storyData.script);

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
        
        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
        console.log('🔵 [CONVERSATION] Agent ID:', agentId ? `Found (${agentId})` : 'MISSING');

        if (!agentId) {
            console.error('❌ [CONVERSATION] No agent ID configured in environment');
            console.error('❌ [CONVERSATION] Set VITE_ELEVENLABS_AGENT_ID in .env file');
            setTranscript(prev => prev + '\n\n❌ Conversation mode disabled - Agent ID not configured.');
            return;
        }

        try {
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
        }
    };

    useEffect(() => {
        // Start playing narration when component mounts
        playNarration();

        return () => {
            // Cleanup
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            conversation.endSession();
        };
    }, []);

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
                    </div>
                )}
            </div>
        </motion.div>
    );
}
