import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Bot, User, Loader2, Sparkles, Trash2, Copy, Check, FileText, Briefcase, Brain } from 'lucide-react';
import { chatWithAI, scoreCV, matchJobs } from '../services/googleai.service';
import { jobService } from '../services/jobservice';
import '../CSS/ChatBox.css';

const MODES = {
  CHAT: 'chat',
  CV: 'cv',
  MATCH: 'match'
};

const quickActions = [
  { label: 'Hỏi đáp', icon: <MessageSquare size={13} />, mode: MODES.CHAT, color: '#3b82f6' },
  { label: 'Chấm CV', icon: <FileText size={13} />, mode: MODES.CV, color: '#10b981' },
  { label: 'Finding Job', icon: <Briefcase size={13} />, mode: MODES.MATCH, color: '#f59e0b' },
];

const WELCOME_MSG = {
  [MODES.CHAT]: "Xin chào! 👋 Mình là STU AI powered by Google Gemini.\n\nMình có thể:\n• Trả lời câu hỏi về STULance\n• Mẹo Freelance cho sinh viên\n• Hướng dẫn sử dụng nền tảng\n\nGõ bất cứ điều gì nhé!",
  [MODES.CV]: "📋 **Chế độ Chấm CV**\n\nGửi mình nội dung CV/hồ sơ của bạn, mình sẽ:\n• Đánh giá điểm mạnh/yếu\n• Chấm điểm tổng quan (0-100)\n• Gợi ý cải thiện cụ thể\n\nPaste CV của bạn vào đây!",
  [MODES.MATCH]: "🎯 **Chế độ Finding Job**\n\nMình sẽ phân tích kỹ năng của bạn và gợi ý việc làm phù hợp nhất trên STULance.\n\nGõ 'tìm việc' để bắt đầu!"
};

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(MODES.CHAT);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        text: WELCOME_MSG[MODES.CHAT],
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isTyping]);

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessages([{
      id: Date.now(),
      text: WELCOME_MSG[newMode],
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: false
    }]);
    setError(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      time: timeStr,
      isMe: true
    };

    setMessages(prev => [...prev, userMsg]);
    const input = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);
    setError(null);

    try {
      let aiResponse = '';

      if (mode === MODES.CV) {
        aiResponse = await scoreCV(input);
      } else if (mode === MODES.MATCH) {
        const [jobsRes] = await Promise.allSettled([jobService.getAllPublicJobs()]);
        const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value?.data || []).slice(0, 10) : [];
        aiResponse = await matchJobs({ skills: input.split(',').map(s => s.trim()) }, jobs);
      } else {
        aiResponse = await chatWithAI(input, messages);
      }

      const aiMsg = {
        id: Date.now() + 1,
        text: aiResponse,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Error:", err);
      setError(err.message);
      const errMsg = {
        id: Date.now() + 1,
        text: `❌ Lỗi: ${err.message}\n\nVui lòng thử lại hoặc chuyển sang chế độ hỏi đáp.`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: Date.now(),
      text: `Đã xóa lịch sử. ${WELCOME_MSG[mode]}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: false
    }]);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split('**').map((part, j) => 
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="chat-wrapper">
      <button onClick={() => setIsOpen(!isOpen)} className="chat-trigger shadow-lg">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="chat-badge pulse-badge">AI</span>}
      </button>

      {isOpen && (
        <div className="chat-window glass-card">
          {/* HEADER */}
          <div className="chat-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <div className="ai-avatar-header">
                  <Brain size={20} className="text-primary-glow" />
                </div>
                <div>
                  <p className="m-0 fw-bold small text-white d-flex align-items-center gap-1">
                    STU AI <Sparkles size={12} className="text-warning" />
                  </p>
                  <p className="m-0 x-small opacity-75 text-white">Powered by Google Gemini</p>
                </div>
              </div>
              <button className="chat-header-btn" onClick={handleClearChat} title="Xóa lịch sử">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* MODE TABS */}
          <div className="chat-mode-tabs">
            {quickActions.map((action) => (
              <button
                key={action.mode}
                className={`mode-tab ${mode === action.mode ? 'active' : ''}`}
                onClick={() => switchMode(action.mode)}
                style={mode === action.mode ? { borderColor: action.color, color: action.color } : {}}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          {/* MESSAGES */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row ${msg.isMe ? 'msg-me' : 'msg-them'}`}>
                {!msg.isMe && (
                  <div className="msg-avatar">
                    <Bot size={14} />
                  </div>
                )}
                <div className="msg-content">
                  <div className="msg-bubble">
                    {formatMessage(msg.text)}
                  </div>
                  <div className="msg-footer">
                    <span className="msg-time">{msg.time}</span>
                    {!msg.isMe && (
                      <button
                        className="msg-copy-btn"
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        title="Sao chép"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-row msg-them">
                <div className="msg-avatar">
                  <Bot size={14} />
                </div>
                <div className="msg-content">
                  <div className="msg-bubble typing-bubble">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={
                mode === MODES.CV ? 'Paste nội dung CV của bạn...' :
                mode === MODES.MATCH ? 'Nhập kỹ năng: React, Node.js, Figma...' :
                'Nhập câu hỏi...'
              }
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="send-btn"
            >
              {isTyping ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
