import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Volume2, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Location } from '../../data/locations';

const STORY_MODES = [
    { id: 'dark', icon: '🌑', label: 'Shadows', desc: 'Crimes, mysteries, tragedies' },
    { id: 'bright', icon: '🌟', label: 'Lights', desc: 'Achievements, progress, culture' },
    { id: 'both', icon: '🔀', label: 'Complete', desc: 'The full spectrum of reality' },
];

const DATE_RANGES = [
    { id: '1600-1800', label: 'Colonial Era', desc: '1600-1800' },
    { id: '1800-1900', label: 'British Raj', desc: '1800-1900' },
    { id: '1900-1947', label: 'Freedom Struggle', desc: '1900-1947' },
    { id: '1947-1980', label: 'Post-Independence', desc: '1947-1980' },
    { id: '1980-2000', label: 'Modern Mumbai', desc: '1980-2000' },
    { id: '2000-2024', label: 'Contemporary', desc: '2000-Present' },
    { id: 'all', label: 'All Eras', desc: 'Complete Timeline' },
];

const LANGUAGES = [
    { id: 'english', label: 'English', flag: '🇬🇧' },
    { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { id: 'marathi', label: 'Marathi', flag: '🚩' },
    { id: 'hinglish', label: 'Hinglish', flag: '🇮🇳🇬🇧' },
];

const VOICE_STYLES = [
    { id: 'dramatic', label: 'Dramatic', desc: 'Theatrical storyteller' },
    { id: 'friendly', label: 'Local Guide', desc: 'Warm & casual' },
    { id: 'documentary', label: 'Documentary', desc: 'Factual & precise' },
    { id: 'mysterious', label: 'Mysterious', desc: 'Whispered secrets' },
];

interface StoryCustomizerProps {
    location: Location;
    onStartStory: (prefs: any) => void;
    onClose: () => void;
}

export default function StoryCustomizer({ location, onStartStory, onClose }: StoryCustomizerProps) {
    const [preferences, setPreferences] = useState({
        storyMode: 'both',
        dateRange: 'all',
        voiceStyle: 'dramatic',
        language: 'hinglish',
        length: 'standard',
        mode: 'conversation'
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[450] bg-white/30 backdrop-blur-md flex items-center justify-center p-4 font-sans"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative ring-1 ring-black/5"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-purple-900 to-indigo-900 p-6 flex flex-col justify-end">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 rounded-full hover:bg-black/40 text-white transition">
                        <X size={20} />
                    </button>
                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{location.name}</h2>
                            <p className="text-white/70 text-sm">{location.description}</p>
                        </div>
                        <div className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white border border-white/10 flex items-center gap-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            Live Connection
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Modes */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                            <BookOpen size={14} /> Narrative Lens
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {STORY_MODES.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setPreferences(p => ({ ...p, storyMode: mode.id }))}
                                    className={cn(
                                        "p-4 rounded-xl border text-left transition-all duration-200",
                                        preferences.storyMode === mode.id
                                            ? "bg-white/10 border-white/40 shadow-inner"
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                    )}
                                >
                                    <div className="text-2xl mb-2">{mode.icon}</div>
                                    <div className="font-semibold text-white text-sm">{mode.label}</div>
                                    <div className="text-xs text-gray-400 mt-1">{mode.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Eras */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                                <Clock size={14} /> Time Period
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DATE_RANGES.map(range => (
                                    <button
                                        key={range.id}
                                        onClick={() => setPreferences(p => ({ ...p, dateRange: range.id }))}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-xs border transition-all",
                                            preferences.dateRange === range.id
                                                ? "bg-purple-500/20 border-purple-500/50 text-white"
                                                : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <div className="font-semibold">{range.label}</div>
                                        <div className="text-[10px] opacity-60">{range.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                                🌐 Language
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setPreferences(p => ({ ...p, language: lang.id }))}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-sm border transition-all flex items-center gap-2",
                                            preferences.language === lang.id
                                                ? "bg-cyan-500/20 border-cyan-500/50 text-white"
                                                : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <span className="text-base">{lang.flag}</span>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold flex items-center gap-2">
                            Interaction Style
                        </label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                            <button
                                onClick={() => setPreferences(p => ({ ...p, mode: 'narrate' }))}
                                className={cn(
                                    "flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                                    preferences.mode === 'narrate' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                🎙️ Podcast
                            </button>
                            <button
                                onClick={() => setPreferences(p => ({ ...p, mode: 'conversation' }))}
                                className={cn(
                                    "flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                                    preferences.mode === 'conversation' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                💬 Conversation
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onStartStory(preferences)}
                        className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                    >
                        <Volume2 size={24} className="animate-pulse" /> Begin the Journey
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
