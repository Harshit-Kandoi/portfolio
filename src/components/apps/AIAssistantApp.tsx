import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Send, Bot, User } from 'lucide-react';
import { playTerminalClick } from '../../utils/sounds';

export default function AIAssistantApp() {
  const { chatMessages, addChatMessage, openWindow } = useOSStore();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const theme = useOSStore((state) => state.theme);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const suggestions = [
    "Tell me about Harshit",
    "Open Resume",
    "Show AI projects",
    "Show cloud projects",
    "Why hire him?",
    "Open GitHub"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    playTerminalClick();
    addChatMessage('user', text);
    
    // Process response simulation with slight delay
    setTimeout(() => {
      processAssistantResponse(text);
    }, 850);
  };

  const processAssistantResponse = (query: string) => {
    const q = query.toLowerCase();
    let reply = "I'm not sure about that query, but you can explore Harshit's apps using the start menu or double clicking desktop shortcuts!";
    
    if (q.includes('about') || q.includes('who is') || q.includes('tell me about')) {
      reply = "Harshit Kandoi is an Associate Software Engineer at ThoughtIn Solutions. He specializes in Python backend APIs, Google Cloud Platform integrations, and AI models. I am opening the About Me window for you to review his details.";
      openWindow('about');
    } 
    else if (q.includes('resume') || q.includes('cv')) {
      reply = "Right away! Opening Harshit's resume viewer for you to download, print, or review.";
      openWindow('resume');
    } 
    else if (q.includes('ai project') || q.includes('movie recommender') || q.includes('yolo') || q.includes('doom')) {
      reply = "Harshit has built several AI/ML projects: ASL Sign Detection (YOLOv5), Doom Deep Q-Learning agent, and Movie Recommender. I've opened the Projects app for you to check them out.";
      openWindow('projects');
    } 
    else if (q.includes('cloud project') || q.includes('emulator') || q.includes('gcp') || q.includes('backend')) {
      reply = "Harshit's flagship cloud project is the 'Local GCP Emulator' simulating Firestore and Pub/Sub offline. I've opened the Projects app where you can view it.";
      openWindow('projects');
    } 
    else if (q.includes('why hire') || q.includes('hire him') || q.includes('strength')) {
      reply = "Harshit is a Google Cloud Associate Cloud Engineer (ACE), experienced in building production microservices, containerizing with Docker, and setting up automated CI/CD pipelines. I've opened the Experience app showing his professional timeline.";
      openWindow('experience');
    } 
    else if (q.includes('github')) {
      reply = "Certainly! Launching Harshit's GitHub profile in a new browser tab.";
      window.open('https://github.com/Harshit-Kandoi', '_blank');
    } 
    else if (q.includes('skills') || q.includes('technologies')) {
      reply = "Opening Harshit's interactive Skills constellation. You can hover over skill points to reveal projects built using them.";
      openWindow('skills');
    }
    else if (q.includes('contact') || q.includes('email') || q.includes('hire')) {
      reply = "Opening Contact.exe so you can send Harshit an email or connect on LinkedIn!";
      openWindow('contact');
    }

    addChatMessage('assistant', reply);
  };

  const isLight = theme === 'light';
  const chatBg = isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100';
  const userMsgBg = isLight ? 'bg-purple-50 text-purple-900' : 'bg-purple-950/40 text-purple-300 border border-purple-800/30';
  const botMsgBg = isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/5 text-gray-300 border border-white/5';
  const footerBg = isLight ? 'bg-gray-100' : 'bg-slate-900/60 border-t border-white/5';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${chatBg}`}>
      {/* Scrollable messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 max-w-[85%] ${
                isBot ? 'self-start' : 'self-end flex-row-reverse space-x-reverse ml-auto'
              }`}
            >
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                isBot 
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/20' 
                  : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </span>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed text-justify ${isBot ? botMsgBg : userMsgBg}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      <div className={`px-4 py-2 flex flex-wrap gap-1.5 border-t ${isLight ? 'border-gray-200 bg-gray-50/70' : 'border-white/5 bg-black/10'} shrink-0 select-none`}>
        {suggestions.map((sug) => (
          <button
            key={sug}
            onClick={() => handleSend(sug)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition border ${
              isLight 
                ? 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200' 
                : 'bg-slate-900 hover:bg-white/5 text-purple-400 border-purple-500/20 hover:text-white'
            }`}
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Message box */}
      <div className={`p-3.5 flex items-center space-x-2 shrink-0 ${footerBg}`}>
        <input
          type="text"
          placeholder="Ask me anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend(inputText);
              setInputText('');
            }
          }}
          className={`flex-grow px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 placeholder-gray-400 ${
            isLight ? 'bg-black/5 border-black/10 text-gray-800' : ''
          }`}
        />
        <button
          onClick={() => {
            handleSend(inputText);
            setInputText('');
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
