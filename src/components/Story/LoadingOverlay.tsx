import { motion } from 'framer-motion';

export default function LoadingOverlay({ step }: { step: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center font-sans"
        >
            <div className="relative mb-8">
                <div className="h-24 w-24 border-2 border-white/5 rounded-full absolute top-0 left-0"></div>
                <div className="h-24 w-24 border-2 border-t-white border-r-white/50 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="h-12 w-12 bg-white rounded-full blur-xl absolute top-6 left-6 animate-pulse opacity-50"></div>
            </div>
            <h2 className="text-3xl font-light text-white mb-4 tracking-tight">Constructing Narrative</h2>
            <div className="flex items-center gap-3">
                <div className="h-1 w-1 bg-cyan-400 rounded-full animate-bounce"></div>
                <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">{step}</p>
                <div className="h-1 w-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            </div>
        </motion.div>
    );
}
