import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Loader2, Send } from 'lucide-react';
import axios from 'axios';

interface Message {
    id: string;
    user: {
        id: string;
        display_name: string;
        email: string;
    };
    content: string;
    created_at: string;
}

interface ChatRoomProps {
    projectId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ projectId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectDelayRef = useRef(1000);

    const fetchHistory = useCallback(async (cursor?: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
            const url = `${apiBase}/chat/${projectId}/history/${cursor ? `?cursor=${cursor}` : ''}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newMessages = response.data.results || response.data.data || [];
            if (cursor) {
                setMessages(prev => [...prev, ...newMessages]);
            } else {
                setMessages(newMessages);
            }
            setNextCursor(response.data.next || null);
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [projectId]);

    const connectWebSocket = useCallback(() => {
        const token = localStorage.getItem('access_token');
        let wsBase = import.meta.env.VITE_WS_URL;

        if (!wsBase) {
            // Derive WS URL from API base if missing
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
            wsBase = apiBase.replace('http', 'ws').replace('/api/v1', '');
        }

        const wsUrl = `${wsBase}/ws/chat/${projectId}/?token=${token}`;

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Chat WebSocket connected');
            setIsConnected(true);
            reconnectDelayRef.current = 1000;
        };

        socket.onmessage = (event) => {
            console.log('Chat WebSocket message received:', event.data);
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'chat_message' || data.id) {
                    const msg = data.type === 'chat_message' ? data.message : data;
                    setMessages(prev => [msg, ...prev]);
                }
            } catch (err) {
                console.error('Failed to parse chat message:', err);
            }
        };

        socket.onclose = (event) => {
            console.log('Chat WebSocket closed', event.code);
            setIsConnected(false);

            if (event.code !== 4001 && event.code !== 4003) {
                const delay = reconnectDelayRef.current;
                reconnectDelayRef.current = Math.min(delay * 2, 30000) + Math.random() * 1000;
                reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
            }
        };

        socket.onerror = (error) => {
            console.error('Chat WebSocket error', error);
            socket.close();
        };
    }, [projectId]);

    useEffect(() => {
        fetchHistory();
        connectWebSocket();

        return () => {
            if (socketRef.current) socketRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [fetchHistory, connectWebSocket]);

    useEffect(() => {
        if (scrollRef.current) {
            // We want to stay at the bottom if we're already there, or if a new message comes in
            // But since messages are newest first in the array for easier prepending, we just reverse or handle accordingly.
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const messageData = {
            message: inputValue.trim()
        };

        socketRef.current.send(JSON.stringify(messageData));
        setInputValue('');
    };

    return (
        <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    Project Chat
                    {!isConnected && <span className="text-xs text-yellow-500 font-normal">(Reconnecting...)</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col-reverse gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.user.id === user?.id ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{msg.user.display_name[0]}</AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col max-w-[80%] ${msg.user.id === user?.id ? 'items-end' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold">{msg.user.display_name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`rounded-2xl px-4 py-2 text-sm ${msg.user.id === user?.id
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {nextCursor && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchHistory(nextCursor)}
                                className="self-center text-xs"
                            >
                                Load older messages
                            </Button>
                        )}
                        {isLoadingHistory && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!isConnected || !inputValue.trim()} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChatRoom;
