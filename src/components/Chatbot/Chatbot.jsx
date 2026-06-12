import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import api from '../../services/api';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi! I'm your SupportFlow Assistant. How can I help you today? I can search your tickets, comments, and profile information to assist you." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send chat request to backend API
      const response = await api.post('/chatbot/chat', {
        message: userMessage,
        history: updatedMessages.slice(1, -1) // Send history excluding welcome message and current message
      });

      const botReply = response.data.response;
      setMessages((prev) => [...prev, { role: 'model', content: botReply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMessage = error.response?.data?.detail || "Sorry, I ran into an issue getting that answer. Please try again.";
      setMessages((prev) => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Escape standard HTML tags
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // Code blocks: ```lang code ``` -> <pre><code>code</code></pre>
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre class="chatbot-code-block"><code>${code.trim()}</code></pre>`;
    });
    
    // Inline code: `code` -> <code>code</code>
    html = html.replace(/`([^`]+)`/g, '<code class="chatbot-inline-code">$1</code>');
    
    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Bullet lists: - item -> <li>item</li>
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        if (!inList) {
          inList = true;
          return `<ul class="chatbot-list"><li>${content}</li>`;
        }
        return `<li>${content}</li>`;
      } else {
        if (inList) {
          inList = false;
          return `</ul><p class="chatbot-para">${line}</p>`;
        }
        return line ? `<p class="chatbot-para">${line}</p>` : '';
      }
    });
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    return processedLines.join('');
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          className="chatbot-fab" 
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant"
        >
          <MessageSquare size={24} />
          <span className="chatbot-fab-pulse"></span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <div className="chatbot-header-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3>SupportFlow AI</h3>
                <span className="chatbot-status-indicator">Online</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className="chatbot-message-avatar">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className="chatbot-message-bubble">
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} 
                    />
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="chatbot-message-row bot">
                <div className="chatbot-message-avatar">
                  <Bot size={14} />
                </div>
                <div className="chatbot-message-bubble loading">
                  <div className="chatbot-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="chatbot-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about tickets, comments, statuses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
