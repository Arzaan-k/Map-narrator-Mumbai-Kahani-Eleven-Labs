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
    const [phase, setPhase] = useState<'connecting' | 'playing' | 'live' | 'ended'>('connecting');
    const [textInput, setTextInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isPlaying, setIsPlaying] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasStarted = useRef(false);

    // Check mode - podcast or conversation
    const isPodcastMode = storyData.preferences?.mode !== 'conversation';

    // Build dynamic prompt for conversation
    const agentPrompt = `You are "KAHAANI" - Mumbai's legendary AI storyteller.

LOCATION: ${location.name}, Mumbai
KNOWLEDGE: ${storyData.scrapedContent || storyData.knowledgeBase || 'Historical facts about ' + location.name}
STYLE: ${storyData.preferences?.voiceStyle || 'dramatic'}
LANGUAGE: ${storyData.preferences?.language || 'english'}

BEHAVIOR:
1. Tell engaging stories about ${location.name}
2. Answer questions when asked
3. Use ONLY verified facts
4. Be conversational and warm`;

    // ElevenLabs Conversational AI (for conversation mode)
    const conversation = useConversation({
        overrides: {
            agent: {
                prompt: { prompt: agentPrompt },
                firstMessage: `Namaste! Welcome to ${location.name}! Let me share some fascinating stories...`,
                language: storyData.preferences?.language === 'hindi' ? 'hi' : 'en'
            },
            tts: { voiceId: 'pNInz6obpgDQGcFmaJgB' }
        },
        onConnect: () => {
            setPhase('live');
            setIsPlaying(true);
            setTranscript(`🎙️ KAHAANI LIVE at ${location.name}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
        },
        onDisconnect: () => {
            setIsPlaying(false);
            setPhase('ended');
        },
        onMessage: (message: any) => {
            const text = message.message || message.text || '';
            if (text) {
                const isUser = message.source === 'user';
                setTranscript(prev => prev + `\n\n${isUser ? '👤 You' : '🎙️ KAHAANI'}:\n${text}`);
            }
        },
        onError: (error: any) => {
            console.error('Conversation error:', error);
        }
    });

    const { status, isSpeaking, sendUserMessage } = conversation;

    // ═══════════════════════════════════════════════════════
    // PODCAST MODE: TTS + Audio Playback
    // ═══════════════════════════════════════════════════════
    const playPodcast = useCallback(async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        try {
            setPhase('playing');
            setTranscript(`🎙️ PODCAST: ${location.name}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${storyData.script}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⏳ Generating audio...`);

            console.log('🎙️ Requesting TTS from backend...');
            console.log('📝 Script length:', storyData.script.length, 'characters');

            // Use backend endpoint to avoid CORS
            const response = await fetch('http://localhost:3001/api/elevenlabs/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: storyData.script
                })
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ TTS API Error:', errorData);
                setTranscript(prev => prev.replace('⏳ Generating audio...', `❌ API Error ${response.status}\n\n${errorData.error || 'Unknown error'}`));
                throw new Error(`TTS Error ${response.status}: ${errorData.error}`);
            }

            const blob = await response.blob();
            console.log('✓ Audio blob received:', blob.size, 'bytes', 'type:', blob.type);

            if (blob.size === 0) {
                throw new Error('Received empty audio blob');
            }

            const url = URL.createObjectURL(blob);
            console.log('✓ Blob URL created:', url);

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.volume = volume;

            setTranscript(prev => prev.replace('⏳ Generating audio...', '▶️ Playing audio...'));

            audio.onplay = () => {
                console.log('▶️ Audio started playing');
                setIsPlaying(true);
            };

            audio.onended = () => {
                console.log('✓ Audio playback completed');
                setIsPlaying(false);
                setTranscript(prev => prev + '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ Podcast complete!');
                setPhase('ended');
            };

            audio.onerror = (e) => {
                console.error('❌ Audio playback error:', e);
                setTranscript(prev => prev + '\n\n❌ Audio playback failed');
                setPhase('ended');
            };

            // Try to play
            try {
                await audio.play();
                console.log('✓ Audio play() called successfully');
            } catch (playError: any) {
                console.error('❌ Audio play error:', playError);
                if (playError.name === 'NotAllowedError') {
                    setTranscript(prev => prev.replace('▶️ Playing audio...', '⏸️ Click anywhere to play'));
                }
            }

        } catch (error: any) {
            console.error('❌ Podcast generation failed:', error);
            setTranscript(prev => prev + `\n\n❌ Error: ${error.message}`);
            setPhase('ended');
        }
    }, [storyData.script, volume, location.name]);

    // ═══════════════════════════════════════════════════════
    // CONVERSATION MODE: ElevenLabs Agent
    // ═══════════════════════════════════════════════════════
    const startConversation = useCallback(async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

        if (!agentId || agentId.length < 10) {
            setTranscript(`❌ Missing Agent ID\n\nAdd VITE_ELEVENLABS_AGENT_ID to .env.local`);
            setPhase('ended');
            return;
        }

        try {
            setTranscript(`🔄 Connecting to KAHAANI...\n\n📍 ${location.name}`);
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await conversation.startSession({ agentId, connectionType: 'webrtc' });
        } catch (error: any) {
            console.error('Connection failed:', error);
            setTranscript(`❌ Connection Failed: ${error.message}`);
            setPhase('ended');
        }
    }, [conversation, location.name]);

    // ═══════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════
    const handleSend = () => {
        if (!textInput.trim() || status !== 'connected') return;
        sendUserMessage(textInput);
        setTranscript(prev => prev + `\n\n👤 You:\n${textInput}`);
        setTextInput('');
    };

    const handleSave = () => {
        if (!user?.id) return;
        const saved = JSON.parse(localStorage.getItem(`stories_${user.id}`) || '[]');
        saved.push({ location: location.name, script: storyData.script, savedAt: new Date().toISOString() });
        localStorage.setItem(`stories_${user.id}`, JSON.stringify(saved));
        setIsSaved(true);
    };

    // Start based on mode
    useEffect(() => {
        console.log('🎭 Mode detected:', isPodcastMode ? 'PODCAST' : 'CONVERSATION');
        console.log('📦 Story data:', { mode: storyData.preferences?.mode, hasScript: !!storyData.script });

        if (isPodcastMode) {
            console.log('▶️ Starting PODCAST mode');
            playPodcast();
        } else {
            console.log('▶️ Starting CONVERSATION mode');
            startConversation();
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            conversation.endSession();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [transcript]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
        if (status === 'connected') conversation.setVolume({ volume });
    }, [volume]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[1000] w-[420px] h-[680px] rounded-3xl overflow-hidden shadow-2xl"
        >
            {/* Abstract Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-fuchsia-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent" />

            {/* Animated Orbs */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-40 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 flex flex-col h-full">

                {/* Header */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' :
                                phase === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'
                                }`} />
                            <div>
                                <h2 className="text-lg font-bold text-white">{location.name}</h2>
                                <p className="text-xs text-white/60">
                                    {isPodcastMode ? '🎙️ Podcast' : '💬 Conversation'} • {phase === 'playing' || phase === 'live' ? 'Playing' : phase}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={handleSave} className={`p-2.5 rounded-xl transition-all ${isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                                <BookmarkPlus size={18} />
                            </button>
                            <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Visualizer */}
                <div className="flex justify-center py-4">
                    <div className="relative">
                        <Visualizer isPlaying={isPlaying || isSpeaking} />
                        {(isPlaying || isSpeaking) && (
                            <motion.div
                                className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/30 blur-xl"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        )}
                    </div>
                </div>

                {/* Transcript */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4">
                    <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-light">
                        {transcript || '🎙️ Loading...'}
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    {/* Volume */}
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={() => setVolume(v => v > 0 ? 0 : 0.8)} className="text-white/60 hover:text-white">
                            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400" />
                    </div>

                    {/* Podcast Controls */}
                    {isPodcastMode && (
                        <div className="space-y-2">
                            {audioRef.current && (
                                <button
                                    onClick={() => {
                                        if (audioRef.current) {
                                            if (isPlaying) {
                                                audioRef.current.pause();
                                            } else {
                                                audioRef.current.play().catch(e => console.error('Play error:', e));
                                            }
                                        }
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                                >
                                    {isPlaying ? '⏸️ Pause' : '▶️ Play Audio'}
                                </button>
                            )}
                            <div className="text-center text-white/60 text-sm">
                                {phase === 'playing' && isPlaying ? '🎙️ Playing...' :
                                    phase === 'playing' && !isPlaying ? '⏸️ Paused' :
                                        phase === 'connecting' ? '⏳ Generating...' :
                                            phase === 'ended' ? '✅ Complete' : '⏳ Loading...'}
                            </div>
                        </div>
                    )}

                    {/* Conversation Input */}
                    {!isPodcastMode && (
                        <div className="flex gap-2">
                            <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-xl ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..." className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50" />
                            <button onClick={handleSend} disabled={status !== 'connected'}
                                className="p-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 disabled:from-gray-600 disabled:to-gray-600 rounded-xl">
                                <Send size={20} className="text-white" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
