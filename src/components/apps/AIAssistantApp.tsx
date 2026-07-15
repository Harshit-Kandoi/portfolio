import React, { useState, useRef, useEffect } from 'react';
import { useOSStore, ChatMessage } from '../../store/useOSStore';
import { Send, Bot, User } from 'lucide-react';
import { playTerminalClick } from '../../utils/sounds';

const WITTY_RESPONSES = [
  "I'm not sure about that query, but you can explore Harshit's apps using the start menu or double clicking desktop shortcuts!",
  "Still not matching anything in my database. Are you testing my limits? Try asking about 'GCP', 'Resume', or 'ASL Sign Detection'.",
  "Okay, you're definitely playing with me now. 🤖 I'm a portfolio guide, not a general-purpose oracle! Feel free to ask 'Why hire him?'.",
  "Error 404: Answer not found. Please insert coffee to continue. ☕ Or maybe just try clicking on 'Projects' in the taskbar!",
  "I've initiated self-destruction sequence in T-minus 10... Just kidding! But seriously, let's talk about Harshit's software skills."
];

const SKILL_ALIASES = ["gcp", "resume", "cv", "ai project", "movie recommender", "yolo", "doom", "cloud project", "emulator", "backend", "why hire", "hire him", "strength", "github", "skills", "technologies", "contact", "email", "hire", "about", "who is", "tell me about"];

const getBubbleShortcuts = (text: string, openWindow: (id: string) => void) => {
  const textLower = text.toLowerCase();
  const actions: { label: string; action: () => void }[] = [];

  if (textLower.includes("about me") || textLower.includes("about window") || textLower.includes("about me window")) {
    actions.push({ label: "Open About.exe", action: () => openWindow('about') });
  }
  if (textLower.includes("resume viewer") || textLower.includes("resume.pdf")) {
    actions.push({ label: "Open Resume.pdf", action: () => openWindow('resume') });
  }
  if (textLower.includes("projects app") || textLower.includes("projects file explorer")) {
    actions.push({ label: "Open Projects.exe", action: () => openWindow('projects') });
  }
  if (textLower.includes("skills constellation") || textLower.includes("skills")) {
    actions.push({ label: "Open Skills.exe", action: () => openWindow('skills') });
  }
  if (textLower.includes("contact.exe") || textLower.includes("contact box")) {
    actions.push({ label: "Open Contact.exe", action: () => openWindow('contact') });
  }
  if (textLower.includes("github profile")) {
    actions.push({ label: "Launch GitHub", action: () => window.open('https://github.com/Harshit-Kandoi', '_blank') });
  }
  if (textLower.includes("experience app")) {
    actions.push({ label: "Open Experience.exe", action: () => openWindow('experience') });
  }

  return actions;
};

const AssistantBubble = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    if (currentIndex < words.length) {
      const delay = 50; // fast word-by-word typing
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + (prev ? ' ' : '') + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, words, onComplete]);

  const isTyping = currentIndex < words.length;

  return (
    <p className="leading-relaxed text-justify">
      {displayText}
      {isTyping && (
        <span className="inline-block w-1.5 h-3.5 bg-purple-500 ml-1 animate-pulse" />
      )}
    </p>
  );
};

const AssistantBubbleWrapper = ({ msg, openWindow, isNew }: { msg: ChatMessage; openWindow: (id: string) => void; isNew: boolean }) => {
  const [isDone, setIsDone] = useState(!isNew);
  const isAssistant = msg.sender === 'assistant';

  if (!isAssistant) {
    return (
      <div className="p-3 rounded-2xl text-xs leading-relaxed text-justify bg-purple-950/40 text-purple-300 border border-purple-800/30 shadow-sm">
        {msg.text}
      </div>
    );
  }

  const shortcuts = getBubbleShortcuts(msg.text, openWindow);

  return (
    <div className="p-3 rounded-2xl text-xs bg-white/5 text-gray-300 border border-white/5 flex flex-col space-y-2.5 shadow-sm">
      {isNew ? (
        <AssistantBubble 
          text={msg.text} 
          onComplete={() => setIsDone(true)} 
        />
      ) : (
        <p className="leading-relaxed text-justify">{msg.text}</p>
      )}
      {isDone && shortcuts.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 animate-fade-in">
          {shortcuts.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg border border-purple-500/30 transition active:scale-95 shadow"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AIAssistantApp() {
  const { chatMessages, addChatMessage, openWindow } = useOSStore();
  const [inputText, setInputText] = useState('');
  const [unsupportedCount, setUnsupportedCount] = useState(0);
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
    }, 600);
  };

  const processAssistantResponse = (query: string) => {
    const q = query.toLowerCase();
    
    // Check if the query is supported
    const isSupported = SKILL_ALIASES.some(keyword => q.includes(keyword));
    
    let reply = "";
    if (isSupported) {
      setUnsupportedCount(0); // Reset logic!
      
      if (q.includes('about') || q.includes('who is') || q.includes('tell me about')) {
        reply = "Harshit Kandoi is an Associate Software Engineer at ThoughtIn Solutions. He specializes in Python backend APIs, Google Cloud Platform integrations, and AI models. I've prepared shortcuts below to open his About Me window.";
      } 
      else if (q.includes('resume') || q.includes('cv')) {
        reply = "Certainly! I've loaded shortcuts for Harshit's resume viewer so you can download, print, or review his career timeline.";
      } 
      else if (q.includes('ai project') || q.includes('movie recommender') || q.includes('yolo') || q.includes('doom')) {
        reply = "Harshit has built several AI/ML projects: ASL Sign Detection (YOLOv5), Doom Deep Q-Learning agent, and Movie Recommender. Use the shortcut below to check them out in the Projects app.";
      } 
      else if (q.includes('cloud project') || q.includes('emulator') || q.includes('gcp') || q.includes('backend')) {
        reply = "Harshit's flagship cloud project is the 'Local GCP Emulator' simulating Firestore and Pub/Sub offline. I've prepared a shortcut to open the Projects app where you can view it.";
      } 
      else if (q.includes('why hire') || q.includes('hire him') || q.includes('strength')) {
        reply = "Harshit is a Google Cloud Associate Cloud Engineer (ACE), experienced in building production microservices, containerizing with Docker, and setting up automated CI/CD pipelines. Open the Experience app showing his professional timeline.";
      } 
      else if (q.includes('github')) {
        reply = "Certainly! Launch his GitHub profile using the button below.";
      } 
      else if (q.includes('skills') || q.includes('technologies')) {
        reply = "Use the shortcut below to inspect Harshit's interactive Skills constellation. You can hover over skill points to reveal projects built using them.";
      }
      else if (q.includes('contact') || q.includes('email') || q.includes('hire')) {
        reply = "Use the shortcut below to open Contact.exe so you can send Harshit an email or copy contact info.";
      }
    } else {
      // Unsupported query logic
      const index = Math.min(unsupportedCount, WITTY_RESPONSES.length - 1);
      reply = WITTY_RESPONSES[index];
      setUnsupportedCount(prev => prev + 1);
    }

    addChatMessage('assistant', reply);
  };

  const isLight = theme === 'light';
  const chatBg = isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100';
  const footerBg = isLight ? 'bg-gray-100' : 'bg-slate-900/60 border-t border-white/5';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${chatBg} custom-scrollbar`}>
      {/* Scrollable messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatMessages.map((msg, idx) => {
          const isBot = msg.sender === 'assistant';
          // Check if this message was just added in the current turn
          const isNew = isBot && idx === chatMessages.length - 1 && msg.id !== '1';
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
              <AssistantBubbleWrapper 
                msg={msg} 
                openWindow={openWindow} 
                isNew={isNew} 
              />
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
                ? 'bg-gray-50 hover:bg-gray-100 text-gray-655 border-gray-200' 
                : 'bg-slate-900 hover:bg-white/5 text-purple-400 border-purple-500/20 hover:text-white'
            }`}
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
          setInputText('');
        }}
        className={`p-3.5 flex items-center space-x-2 shrink-0 ${footerBg}`}
      >
        <input
          type="text"
          placeholder="Ask me anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className={`flex-grow px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 placeholder-gray-400 ${
            isLight ? 'bg-black/5 border-black/10 text-gray-800' : ''
          }`}
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
