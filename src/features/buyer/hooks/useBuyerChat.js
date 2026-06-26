import { useState, useRef, useEffect } from 'react';
import { sendChat } from '../../../lib/agentApi';

export const useBuyerChat = ({
  buyerAiQuery,
  setBuyerAiQuery,
  buyerAiMessages,
  setBuyerAiMessages,
  setBuyerAiStatus,
  userStores,
  setSelectedStorefront
}) => {
  const [chatOpen, setChatOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return false;
  });
  const [abortController, setAbortController] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [chatWidth, setChatWidth] = useState(380);
  const chatEndRef = useRef(null);

  // ── Abort helper ──────────────────────────────────────────────────────────
  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
      setBuyerAiStatus('');
      setStreamingMessage(null);
      setAbortController(null);
    }
  };

  // ── Chat panel resize drag ────────────────────────────────────────────────
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) setChatWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [buyerAiMessages, streamingMessage, chatOpen]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleBuyerAiSubmit = async (e) => {
    e.preventDefault();
    if (!buyerAiQuery.trim()) return;

    const userText = buyerAiQuery.trim();
    const newMsgId = Date.now();

    setBuyerAiMessages(prev => [...prev, { role: 'user', text: userText, id: `user-${newMsgId}` }]);
    setBuyerAiQuery('');
    setBuyerAiStatus({ message: 'analyzing request...' }); // Instant UX feedback
    setStreamingMessage(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const storeContext = { session_id: 'buyer_session_1', storeName: 'SERA AI Store', chatMode: 'buyer' };

      const response = await sendChat({
        input: userText,
        history: buyerAiMessages,
        storeContext,
        chatMode: 'buyer'
      }, controller.signal);

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamingText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === 'cognition' && data.message) {
                // Always update badge regardless of whether text is streaming
                setBuyerAiStatus(data);
              } else if (data.type === 'agent_message_start' && data.text) {
                // Live streaming: show text as it arrives — keep status alive (don't clear)
                streamingText = data.text;
                setStreamingMessage({ id: `streaming-${newMsgId}`, text: streamingText, isStreaming: true });
              } else if (data.type === 'final') {
                const finalText = data.text || streamingText;
                setStreamingMessage(null);
                setBuyerAiMessages(prev => [...prev, { role: 'agent', text: finalText, id: `agent-${newMsgId}` }]);
                setBuyerAiStatus(''); // ← Only clear here when truly done
                streamingText = '';
              }
            } catch {
              // Ignore invalid JSON chunks
            }
          }
        }
        if (done) break;
      }

      // Edge case: stream ended with no final event
      if (streamingText) {
        setStreamingMessage(null);
        setBuyerAiMessages(prev => [...prev, { role: 'agent', text: streamingText, id: `agent-${newMsgId}` }]);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setStreamingMessage(null);
        return;
      }
      console.error('Failed buyer AI assistant search:', err);
      setStreamingMessage(null);
      setBuyerAiMessages(prev => [...prev, {
        role: 'agent',
        text: 'Sorry, there was an issue communicating with SERA AI. Please try again.',
        id: `agent-err-${newMsgId}`
      }]);
    } finally {
      setBuyerAiStatus('');
      setStreamingMessage(null);
      setAbortController(null);
    }
  };

  return {
    chatOpen, setChatOpen,
    chatWidth, startResizing, isResizing,
    abortController, handleAbort,
    streamingMessage, setStreamingMessage,
    chatEndRef,
    handleBuyerAiSubmit
  };
};
