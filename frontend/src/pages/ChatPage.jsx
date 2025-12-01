import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RagAssistantUI from '../components/RagAssistantUI';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const { token } = useAuth();

    const handleNewChat = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/history', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentSessionId(data.id);
            }
        } catch (err) {
            console.error("Failed to create new chat", err);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar
                currentSessionId={currentSessionId}
                onSelectSession={setCurrentSessionId}
                onNewChat={handleNewChat}
            />
            <div className="flex-1 flex flex-col h-full relative">
                <RagAssistantUI sessionId={currentSessionId} />
            </div>
        </div>
    );
};

export default ChatPage;
