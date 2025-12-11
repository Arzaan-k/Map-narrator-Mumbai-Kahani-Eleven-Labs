import { motion } from 'framer-motion';

export default function Visualizer({ isPlaying }: { isPlaying: boolean }) {
    return (
        <div className="relative flex items-center justify-center h-64 w-64 mx-auto my-8 pointer-events-none select-none">
            {/* Central Orb */}
            <motion.div
                className="absolute h-32 w-32 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-full z-10 blur-md"
                animate={isPlaying ? {
                    scale: [1, 1.15, 0.95, 1],
                    rotate: [0, 90, 180, 270, 360],
                    filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                } : { scale: 1, rotate: 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute h-32 w-32 bg-white rounded-full z-10 mix-blend-overlay opacity-30" />

            {/* Outer Rings / Pulse */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-full w-full rounded-full border border-white/20 bg-white/5"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isPlaying ? {
                        scale: [0.8, 1.4 + (i * 0.2)],
                        opacity: [0.4, 0],
                        borderWidth: ["1px", "0px"]
                    } : {
                        scale: 0.8 + (i * 0.1),
                        opacity: 0.1
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Core Glow */}
            <div className="absolute h-48 w-48 bg-indigo-500/30 rounded-full blur-2xl animate-pulse" />
        </div>
    );
}
