import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center p-6 md:p-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <img src="/logo.png" alt="Syntho Atelier" className="h-12 md:h-16" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                >
                    <button
                        onClick={() => navigate('/auth?mode=login')}
                        className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all text-sm md:text-base"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate('/auth?mode=signup')}
                        className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all text-sm md:text-base flex items-center gap-2 group"
                    >
                        Sign Up
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center px-6 py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center max-w-4xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6"
                    >
                        <span className="inline-block px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-8">
                            Powered by Advanced AI
                        </span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        SYNTHO ATELIER
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl md:text-4xl font-light mb-4 tracking-[0.2em] text-gray-300"
                    >
                        AI FOR IMPACT
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
                    >
                        Transform your documents into intelligent conversations. Upload, ask, and discover insights with our cutting-edge RAG technology.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={() => navigate('/auth?mode=signup')}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/50"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/auth?mode=login')}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm border border-white/10"
                        >
                            Sign In
                        </button>
                    </motion.div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
                >
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                        <p className="text-gray-400">Extract meaningful information from your documents with advanced AI models.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                        <p className="text-gray-400">Get instant answers to your questions with our optimized retrieval system.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Fully Local</h3>
                        <p className="text-gray-400">Your data stays on your machine. Complete privacy and security.</p>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-8 text-gray-500 text-sm">
                <p>&copy; 2024 Syntho Atelier. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
