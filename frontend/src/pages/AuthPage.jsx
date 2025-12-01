import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Lock, User, ArrowRight } from 'lucide-react';

const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const result = await login(username, password);
            if (result.success) {
                navigate('/chat');
            } else {
                setError(result.error || 'Login failed');
            }
        } else {
            const result = await register(username, password);
            if (result.success) {
                setIsLogin(true);
                setError('Registration successful! Please login.');
            } else {
                setError(result.error || 'Registration failed');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20"
            >
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-center text-gray-400 mb-8">
                    {isLogin ? 'Enter your credentials to access your chats' : 'Sign up to start chatting with AI'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
