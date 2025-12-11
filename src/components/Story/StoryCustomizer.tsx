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
            className="fixed inset-0 z-[450] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="bg-white/95 backdrop-blur-xl border border-white/60 w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl relative ring-1 ring-black/5"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-40 bg-gradient-to-r from-indigo-600 to-violet-600 p-8 flex flex-col justify-end">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition backdrop-blur-md border border-white/10">
                        <X size={24} />
                    </button>
                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{location.name}</h2>
                            <p className="text-indigo-100 text-lg font-medium">{location.description}</p>
                        </div>
                        <div className="px-4 py-1.5 bg-green-500/20 backdrop-blur-md rounded-full text-sm font-semibold text-white border border-green-400/30 flex items-center gap-2 shadow-sm">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            Live Connection
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 bg-slate-50/50">

                    {/* Modes */}
                    <div className="space-y-4">
                        <label className="text-sm uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                            <BookOpen size={16} /> Narrative Lens
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {STORY_MODES.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setPreferences(p => ({ ...p, storyMode: mode.id }))}
                                    className={cn(
                                        "p-5 rounded-2xl text-left transition-all duration-300 border",
                                        preferences.storyMode === mode.id
                                            ? "bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-500/20"
                                            : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                                    )}
                                >
                                    <div className="text-3xl mb-3">{mode.icon}</div>
                                    <div className="font-bold text-slate-800 text-base">{mode.label}</div>
                                    <div className="text-sm text-slate-500 mt-1 leading-snug">{mode.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Eras */}
                        <div className="space-y-4">
                            <label className="text-sm uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                                <Clock size={16} /> Time Period
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                                {DATE_RANGES.map(range => (
                                    <button
                                        key={range.id}
                                        onClick={() => setPreferences(p => ({ ...p, dateRange: range.id }))}
                                        className={cn(
                                            "px-4 py-2.5 rounded-xl text-sm font-medium border transition-all shadow-sm",
                                            preferences.dateRange === range.id
                                                ? "bg-violet-600 border-violet-600 text-white shadow-violet-200"
                                                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                        )}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="space-y-4">
                            <label className="text-sm uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                                🌐 Language
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setPreferences(p => ({ ...p, language: lang.id }))}
                                        className={cn(
                                            "px-4 py-3 rounded-xl text-sm font-semibold border transition-all flex items-center gap-3 shadow-sm",
                                            preferences.language === lang.id
                                                ? "bg-cyan-600 border-cyan-600 text-white shadow-cyan-200"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                        )}
                                    >
                                        <span className="text-xl">{lang.flag}</span>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="text-sm uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                            Interaction Style
                        </label>
                        <div className="flex gap-3 p-1.5 bg-slate-200/50 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setPreferences(p => ({ ...p, mode: 'narrate' }))}
                                className={cn(
                                    "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    preferences.mode === 'narrate'
                                        ? "bg-white shadow-md text-indigo-700 ring-1 ring-black/5"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                )}
                            >
                                🎙️ Podcast Mode
                            </button>
                            <button
                                onClick={() => setPreferences(p => ({ ...p, mode: 'conversation' }))}
                                className={cn(
                                    "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    preferences.mode === 'conversation'
                                        ? "bg-white shadow-md text-indigo-700 ring-1 ring-black/5"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                )}
                            >
                                💬 Live Coversation
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onStartStory(preferences)}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xl rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Volume2 size={28} className="animate-pulse" />
                        Begin the Journey
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
