import { useMessages } from '../Components/Message/MessageContext';

// Custom hook for showing toast notifications
export const useToast = () => {
    const { addMessage } = useMessages();

    const showToast = (content, type = 'info') => {
        addMessage({
            _id: `toast_${Date.now()}`,
            content,
            type, // 'success', 'error', 'warning', 'info'
            createdAt: new Date()
        });
    };

    const success = (content) => showToast(content, 'success');
    const error = (content) => showToast(content, 'error');
    const warning = (content) => showToast(content, 'warning');
    const info = (content) => showToast(content, 'info');

    return { showToast, success, error, warning, info };
};
