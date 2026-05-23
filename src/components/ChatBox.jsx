import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, MoreHorizontal } from 'lucide-react';
import '../CSS/ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Chào bạn, TechNova đã nhận được Portfolio của bạn.', time: '10:00', isMe: false },
    { text: 'Dự án StudentCare rất phù hợp với kỹ năng của bạn.', time: '10:01', isMe: false }
  ]);
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    setMessages([...messages, { text: newMessage, time: timeStr, isMe: true }]);
    setNewMessage('');
  };

  return (
    <div className="chat-wrapper">
      <button onClick={() => setIsOpen(!isOpen)} className="chat-trigger shadow-lg">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="chat-badge">2</span>}
      </button>

      {isOpen && (
        <div className="chat-window glass-card">
          <div className="chat-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <div className="online-status"></div>
                <div>
                  <p className="m-0 fw-bold small text-white">TechNova Solutions</p>
                  <p className="m-0 x-small opacity-75 text-white">Hỗ trợ tuyển dụng</p>
                </div>
              </div>
              <MoreHorizontal size={18} className="cursor-pointer text-white" />
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.isMe ? 'msg-me' : 'msg-them'}>
                <div className="msg-bubble">{msg.text}</div>
                <p className="msg-time">{msg.time}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nhập tin nhắn..." 
            />
            <button onClick={handleSendMessage}><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;