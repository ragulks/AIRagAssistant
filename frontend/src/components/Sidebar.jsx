import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, LogOut, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Sidebar = ({ currentSessionId, onSelectSession, onNewChat }) => {
    const [sessions, setSessions] = useState([]);
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, [currentSessionId]); // Refresh when session changes

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleDelete = async (sessionId, e) => {
        e.stopPropagation(); // Prevent selecting the chat when clicking delete

        if (!window.confirm('Are you sure you want to delete this chat?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/history/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // If the deleted session was the current one, clear selection
                if (currentSessionId === sessionId) {
                    onSelectSession(null);
                }
                fetchHistory(); // Refresh the list
            } else {
                const error = await res.json();
                console.error("Delete failed:", error);
                alert("Failed to delete chat: " + (error.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Failed to delete session", err);
            alert("Failed to delete chat. Please try again.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="w-64 bg-gray-900 border-r border-white/10 flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
                <button
                    onClick={onNewChat}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className={`group relative flex items-center gap-2 p-3 rounded-lg transition-colors ${currentSessionId === session.id
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <button
                            onClick={() => onSelectSession(session.id)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span className="truncate text-sm">{session.title}</span>
                        </button>
                        <button
                            onClick={(e) => handleDelete(session.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded transition-opacity shrink-0"
                            title="Delete chat"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between text-white mb-2">
                    <span className="font-medium truncate">{user?.username}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm py-2 px-3 rounded hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
