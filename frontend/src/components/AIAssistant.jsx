import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader, Sparkles } from 'lucide-react';
import { aiAPI } from '../utils/api';

const AIAssistant = ({ onFilterUpdate, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI job assistant. Try:\n• 'Show remote jobs'\n• 'Full-time only'\n• 'High match scores'\n• 'Jobs in Bangalore'\n• 'Clear filters'",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.chat(messageText, currentFilters);
      const data = response.data;

      if (data.results && data.results.length > 0) {
        const result = data.results[0];

        if (result.action === 'update_ui_filters' && result.parameters) {
          if (onFilterUpdate) {
            onFilterUpdate(result.parameters);
          }
        }

        const assistantMessage = {
          role: 'assistant',
          content: result.message || data.message
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage = {
          role: 'assistant',
          content: data.message || "I can help you filter jobs!"
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '🏠 Remote', query: 'Show remote jobs' },
    { label: '⭐ High Match', query: 'High match scores only' },
    { label: '💼 Full-time', query: 'Full-time only' },
    { label: '❌ Clear', query: 'Clear all filters' },
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all z-50"
        >
          <Sparkles size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border-2 border-blue-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={22} />
              <div>
                <h3 className="font-bold">AI Job Assistant</h3>
                <p className="text-xs text-blue-100">Ask me anything</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-lg p-1.5">
              <X size={20} />
            </button>
          </div>

          <div className="p-3 bg-gray-50 border-b">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action.query)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border hover:border-blue-500 hover:bg-blue-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader size={16} className="animate-spin text-blue-600" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;