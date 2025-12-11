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

    // ElevenLabs Conversational AI hook (for follow-up questions)
    const conversation = useConversation({
        onConnect: () => {
            console.log('✓ Connected to ElevenLabs Conversational AI');
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs');
        },
        onMessage: (message: any) => {
            console.log('Conversation message:', message);
            const text = message?.message || message?.text || '';
            if (text && phase === 'conversing') {
                setTranscript(prev => prev + '\n\n' + text);
            }
        },
        onError: (error: any) => {
            console.error('ElevenLabs conversation error:', error);
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
        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

        if (!agentId) {
            console.warn("No agent ID - conversation mode disabled");
            return;
        }

        try {
            await conversation.startSession({
                agentId,
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
            });

            console.log("✓ Conversation mode ready");
            setTranscript(prev => prev + '\n\n🎙️ You can now ask me questions about ' + location.name + '!');

        } catch (error) {
            console.error('Failed to start conversation:', error);
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
                        {phase === 'narrating' && isPlaying ? 'PLAYING' : phase.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{location.name}</h2>
                    <p className="text-slate-500 text-xs tracking-widest uppercase font-medium">
                        {storyData.preferences?.voiceStyle || 'Dramatic'} • {storyData.preferences?.dateRange || 'All Eras'}
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

                {phase === 'conversing' && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
                        <p className="text-sm font-medium text-blue-900">🎙️ Ask me anything about {location.name}!</p>
                        <p className="text-xs text-blue-700 mt-1">Use your microphone to ask questions</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
