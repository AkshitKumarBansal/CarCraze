import React, { useEffect, useState } from 'react';
import { useMessages } from './MessageContext';
import './message-display.css';

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

    const dismissMessage = (id) => {
        setVisibleMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    return (
        <div className="message-toast-container">
            {visibleMessages.map((msg) => (
                <div
                    key={msg.id}
                    className={`message-toast message-toast-${msg.type || 'info'} message-toast-enter`}
                    onClick={() => dismissMessage(msg.id)}
                >
                    <div className="message-icon">{getIcon(msg.type)}</div>
                    <div className="message-content">{msg.content}</div>
                    <button className="message-close" onClick={(e) => {
                        e.stopPropagation();
                        dismissMessage(msg.id);
                    }}>
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MessageDisplay;
