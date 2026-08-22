import React, { useEffect, useState } from 'react';
import { useMessages } from '../../context/MessageContext';

const MessageDisplay = () => {
    const { messages } = useMessages();
    const [visibleMessages, setVisibleMessages] = useState([]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const messageWithId = {
                ...lastMessage,
                id: `${Date.now()}_${Math.random()}`
            };

            // Add to visible messages
            setVisibleMessages((prev) => [...prev, messageWithId]);

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                setVisibleMessages((prev) =>
                    prev.filter((msg) => msg.id !== messageWithId.id)
                );
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [messages]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success':
                return 'border-l-emerald-500';
            case 'error':
                return 'border-l-red-500';
            case 'warning':
                return 'border-l-amber-500';
            case 'info':
            default:
                return 'border-l-blue-500';
        }
    };

    const dismissMessage = (id) => {
        setVisibleMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    return (
        <>
            <style>
                {`
                    @keyframes slideInRight {
                        from { opacity: 0; transform: translateX(100%); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    .animate-slide-in {
                        animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                `}
            </style>
            
            <div className="fixed top-[80px] right-[20px] max-md:right-[10px] max-md:left-[10px] z-[9999] flex flex-col gap-3 max-w-[400px] max-md:max-w-none">
                {visibleMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-center gap-3 p-4 bg-white/95 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md border border-white/20 border-l-4 cursor-pointer transition-all duration-300 animate-slide-in min-w-[300px] max-w-[400px] max-md:min-w-0 max-md:max-w-none hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.1)] ${getTypeColor(msg.type)}`}
                        onClick={() => dismissMessage(msg.id)}
                    >
                        <div className="text-[24px] shrink-0">{getIcon(msg.type)}</div>
                        <div className="flex-1 text-[14px] font-medium text-gray-800 leading-relaxed">{msg.content}</div>
                        <button 
                            className="bg-transparent border-none text-[24px] text-gray-500 cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors shrink-0 hover:bg-black/5 hover:text-gray-800 focus:outline-none" 
                            onClick={(e) => {
                                e.stopPropagation();
                                dismissMessage(msg.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};

export default MessageDisplay;