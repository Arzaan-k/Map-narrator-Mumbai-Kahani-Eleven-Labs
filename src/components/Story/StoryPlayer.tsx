import { useEffect, useState, useRef, useCallback } from 'react';
// import { useConversation } from '@11labs/react';
import Visualizer from './Visualizer';
import { motion } from 'framer-motion';
import { X, Mic, MicOff, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock hook
const useConversation = (config: any) => {
    const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [isMicActive, setIsMicActive] = useState(false);

    return {
        status,
        isMicrophoneActive: isMicActive,
        startSession: async (options?: any) => {
            console.log("Mock session started with:", options);
            // Simulate connection delay
            setTimeout(() => {
                setStatus('connected');
                config.onConnect?.();

                // Simulate initial message
                setTimeout(() => {
                    config.onMessage?.({ text: "Hello! I am your storyteller for today. (Mock Agent)" });
                }, 1000);
            }, 1000);
        },
        endSession: async () => {
            setStatus('disconnected');
            config.onDisconnect?.();
        },
        sendMessage: (text: string) => {
            // Echo back
            setTimeout(() => {
                config.onMessage?.({ text: `You asked: ${text}. Here is a mock response.` });
            }, 1000);
        },
        stopListening: () => setIsMicActive(false),
        startListening: () => setIsMicActive(true)
    }
}

interface StoryPlayerProps {
    location: any;
    storyData: any;
    onClose: () => void;
}

export default function StoryPlayer({ location, storyData, onClose }: StoryPlayerProps) {
    const [transcript, setTranscript] = useState<string>('');
    const [phase, setPhase] = useState<'connecting' | 'narrating' | 'conversing' | 'ended'>('connecting');
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // ElevenLabs conversation hook
    const conversation = useConversation({
        onConnect: () => {
            console.log('Connected to ElevenLabs');
            setPhase('narrating');
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs');
            setPhase('ended');
        },
        onMessage: (message: any) => {
            if (message?.text) {
                setTranscript(prev => prev + ' ' + message.text);
            } else if (typeof message === 'string') {
                setTranscript(prev => prev + ' ' + message);
            }
        },
        onError: (error: any) => {
            console.error('ElevenLabs error:', error);
        },
    });

    const startSession = useCallback(async () => {
        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
        if (!agentId) {
            console.warn("No Agent ID found. Using Mock Mode.");
        }

        try {
            await conversation.startSession({
                agentId,
                overrides: {
                    agent: {
                        firstMessage: storyData.script,
                        prompt: {
                            prompt: `You are "KAHAANI", Mumbai's storyteller. You just narrated a story about ${storyData.areaInfo?.neighborhood}.
YOUR NARRATION WAS:
${storyData.script}

YOUR KNOWLEDGE BASE (use this to answer questions):
${storyData.knowledgeBase}

PERSONALITY: Stay ${storyData.preferences?.voiceStyle || 'dramatic'} in tone.
LANGUAGE: ${storyData.preferences?.language === 'english-hindi' ? 'Use Indian English with Hindi phrases.' : 'Use clean English.'}

WHEN USER ASKS FOLLOW-UP QUESTIONS:
- Answer using ONLY the knowledge base above
- Stay in character as the storyteller
- Keep responses conversational and engaging`
                        }
                    },
                },
            });
            setPhase('narrating');
            if (storyData.script) {
                setTranscript(storyData.script);
            }
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    }, [conversation, storyData]);

    useEffect(() => {
        startSession();
        return () => {
            conversation.endSession();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const handleSend = () => {
        if (!input.trim()) return;
        conversation.sendMessage(input);
        setInput('');
    };

    const toggleMic = () => {
        if (conversation.isMicrophoneActive) {
            conversation.stopListening && conversation.stopListening();
        } else {
            conversation.startListening && conversation.startListening();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[1000] w-full max-w-[400px] h-[600px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden font-sans ring-1 ring-black/5"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 transition z-10">
                <X className="text-gray-500 group-hover:text-black transition-colors" />
            </button>

            <div className="flex flex-col h-full p-6 pt-12">
                <div className="text-center space-y-1 mb-6">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-100/80 border border-blue-200 text-[10px] font-mono text-blue-800 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${phase === 'narrating' || phase === 'conversing' ? 'bg-blue-600 animate-pulse' : 'bg-gray-400'}`} />
                        {phase.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{location.name}</h2>
                    <p className="text-slate-500 text-xs tracking-widest uppercase font-medium">
                        {storyData.preferences.voiceStyle} • {storyData.preferences.era}
                    </p>
                </div>

                <div className="flex-1 w-full flex flex-col items-center min-h-0 relative">
                    <div className="scale-75 origin-center -my-4">
                        <Visualizer isPlaying={phase === 'narrating' || phase === 'conversing'} />
                    </div>

                    {/* Transcript Area */}
                    <div ref={scrollRef} className="w-full mt-4 flex-1 overflow-y-auto px-1 custom-scrollbar text-center mask-linear-fade">
                        <p className="text-lg text-slate-700 leading-relaxed font-light">
                            {transcript || "Connecting to the stream..."}
                        </p>
                    </div>
                </div>

                {/* Interactive Controls */}
                <div className="flex gap-2 items-center w-full mt-4 bg-white/80 p-1.5 pr-2 rounded-full border border-slate-200">
                    <button
                        onClick={toggleMic}
                        className={cn(
                            "p-3 rounded-full transition-all duration-300",
                            conversation.isMicrophoneActive
                                ? 'bg-red-50 text-red-600 shadow-inner'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                        {conversation.isMicrophoneActive ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <div className="flex-1 relative">
                        <input
                            className="w-full bg-transparent border-none py-1.5 px-2 text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm font-medium"
                            placeholder={phase === 'conversing' ? "Ask..." : "Listening..."}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={phase !== 'conversing'}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || phase !== 'conversing'}
                        className="text-slate-400 hover:text-blue-600 disabled:opacity-30 p-1"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
