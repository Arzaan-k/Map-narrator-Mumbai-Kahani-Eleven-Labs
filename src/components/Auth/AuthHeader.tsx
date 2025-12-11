import { UserButton, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookmarkPlus, History } from 'lucide-react';
import { useState } from 'react';

export default function AuthHeader() {
    const { user } = useUser();
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            <div className="fixed top-4 right-4 z-[600] flex items-center gap-3">
                <motion.button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20 hover:bg-white transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <User size={18} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-800">
                        {user?.firstName || 'Profile'}
                    </span>
                </motion.button>

                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-10 h-10 ring-2 ring-blue-500 ring-offset-2"
                        }
                    }}
                />
            </div>

            <AnimatePresence>
                {showProfile && (
                    <ProfileModal onClose={() => setShowProfile(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

function ProfileModal({ onClose }: { onClose: () => void }) {
    const { user } = useUser();
    const [savedStories, setSavedStories] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');

    // Load saved stories from localStorage
    useState(() => {
        const saved = localStorage.getItem(`stories_${user?.id}`);
        if (saved) {
            setSavedStories(JSON.parse(saved));
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                                {user?.firstName?.[0] || 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                                <p className="text-white/80 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${activeTab === 'saved'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <BookmarkPlus size={20} />
                        Saved Stories ({savedStories.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${activeTab === 'history'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <History size={20} />
                        History
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    {activeTab === 'saved' && (
                        <div className="space-y-4">
                            {savedStories.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <BookmarkPlus size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No saved stories yet</p>
                                    <p className="text-sm mt-2">Save stories while listening to revisit them later</p>
                                </div>
                            ) : (
                                savedStories.map((story, idx) => (
                                    <StoryCard key={idx} story={story} />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="text-center py-12 text-gray-500">
                            <History size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">History coming soon</p>
                            <p className="text-sm mt-2">Your listening history will appear here</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

function StoryCard({ story }: { story: any }) {
    return (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{story.location}</h3>
                    <p className="text-sm text-gray-600 mt-1">{story.dateRange} • {story.language}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{story.script?.substring(0, 150)}...</p>
                </div>
                <div className="text-xs text-gray-500">
                    {new Date(story.savedAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
