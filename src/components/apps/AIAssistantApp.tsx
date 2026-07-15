import React, { useState, useRef, useEffect } from 'react';
import { useOSStore, ChatMessage } from '../../store/useOSStore';
import { Send, Bot, User } from 'lucide-react';
import { playTerminalClick } from '../../utils/sounds';

// 5-stage witty response sequence for unsupported queries
const WITTY_STAGES = [
  "I'm not sure about that, but you can explore Harshit's apps using the desktop shortcuts!",
  "Still not matching anything in my database. Try asking about 'GCP', 'Resume', or 'ASL Sign Detection'. I'm patient — for now. 😑",
  "I already told you I'm a portfolio guide, not an oracle. 😅 Let's keep it professional, shall we?",
  "Okay this is the 4th unsupported query. You are REALLY testing me. Initiating... self... destruct... just kidding. MAYBE.",
  "⚠️ CRITICAL SYSTEM FAILURE ⚠️  Initiating self-destruction in T-5... 4... 3... 2... 1... 💥 (Just kidding. But this window will close now. Goodbye.) 👋",
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
  if (textLower.includes("projects app") || textLower.includes("projects file explorer") || textLower.includes("projects")) {
    actions.push({ label: "Open Projects.exe", action: () => openWindow('projects') });
  }
  if (textLower.includes("skills constellation") || textLower.includes("skills")) {
    actions.push({ label: "Open Skills.exe", action: () => openWindow('skills') });
  }
  if (textLower.includes("contact.exe") || textLower.includes("contact box") || textLower.includes("contact") || textLower.includes("email")) {
    actions.push({ label: "Open Contact.exe", action: () => openWindow('contact') });
  }
  if (textLower.includes("github")) {
    actions.push({ label: "Launch GitHub", action: () => window.open('https://github.com/Harshit-Kandoi', '_blank') });
  }
  if (textLower.includes("experience app") || textLower.includes("experience") || textLower.includes("hire")) {
    actions.push({ label: "Open Experience.exe", action: () => openWindow('experience') });
  }
  if (textLower.includes("terminal")) {
    actions.push({ label: "Open Terminal.exe", action: () => openWindow('terminal') });
  }
  if (textLower.includes("blog")) {
    actions.push({ label: "Open Blog Reader", action: () => openWindow('blog') });
  }
  if (textLower.includes("gaming") || textLower.includes("game")) {
    actions.push({ label: "Open Gaming Profile", action: () => openWindow('gaming') });
  }
  if (textLower.includes("snake")) {
    actions.push({ label: "Play Snake 🐍", action: () => openWindow('snake') });
  }
  if (textLower.includes("swipe") || textLower.includes("match") || textLower.includes("role")) {
    actions.push({ label: "Open Portfolio Swipe ❤️", action: () => openWindow('swipe') });
  }
  if (textLower.includes("coffee") || textLower.includes("support")) {
    actions.push({ label: "Buy Me Coffee ☕", action: () => openWindow('coffee') });
  }
  if (textLower.includes("achievements")) {
    actions.push({ label: "Open Achievements", action: () => openWindow('achievements') });
  }

  return actions;
};

const AssistantBubble = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const wordsRef = useRef(text.split(' '));
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const words = wordsRef.current;
    if (currentIndex < words.length) {
      const delay = 50; // fast word-by-word typing
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + (prev ? ' ' : '') + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (!completedRef.current) {
      completedRef.current = true;
      if (onCompleteRef.current) onCompleteRef.current();
    }
  }, [currentIndex]);

  const isTyping = currentIndex < wordsRef.current.length;

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
  const { chatMessages, addChatMessage, openWindow, closeWindow, unlockAchievement } = useOSStore();
  const [inputText, setInputText] = useState('');
  const [unsupportedCount, setUnsupportedCount] = useState(0);
  const [selfDestructActive, setSelfDestructActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const theme = useOSStore((state) => state.theme);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  // Prevent scroll propagation on touchmove boundaries
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const target = e.currentTarget as HTMLElement;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;
      const isScrollable = target.scrollHeight > target.clientHeight;

      if (isScrollable) {
        const isAtTop = target.scrollTop <= 0 && deltaY > 0;
        const isAtBottom = 
          target.scrollHeight - target.scrollTop - target.clientHeight <= 1 && deltaY < 0;

        if ((isAtTop || isAtBottom) && e.cancelable) {
          e.preventDefault();
        }
      } else {
        if (e.cancelable) e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Self-destruct countdown – fires after stage 5 unsupported query
  useEffect(() => {
    if (!selfDestructActive) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          closeWindow('ai');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selfDestructActive, closeWindow]);

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
    const isSupported = SKILL_ALIASES.some(keyword => q.includes(keyword));
    
    let reply = "";
    if (isSupported) {
      setUnsupportedCount(0); // Reset counter on valid query
      
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
      else if (q.includes('why hire') || q.includes('hire him') || q.includes('strength') || q.includes('hire')) {
        reply = "Harshit is a Google Cloud Associate Cloud Engineer (ACE), experienced in building production microservices, containerizing with Docker, and setting up automated CI/CD pipelines. Open the Experience app showing his professional timeline.";
      } 
      else if (q.includes('github')) {
        reply = "Certainly! Launch his GitHub profile using the button below.";
      } 
      else if (q.includes('skills') || q.includes('technologies')) {
        reply = "Use the shortcut below to inspect Harshit's interactive Skills constellation. You can hover over skill points to reveal projects built using them.";
      }
      else if (q.includes('contact') || q.includes('email')) {
        reply = "Use the shortcut below to open Contact.exe so you can send Harshit an email or copy contact info.";
      }
      else if (q.includes('snake')) {
        reply = "Feeling nostalgic? Launch Snake.exe — a Nokia 3310 inspired retro game built right into the OS! 🐍";
      }
      else if (q.includes('swipe') || q.includes('match') || q.includes('role')) {
        reply = "Try Portfolio Swipe — a Tinder-style experience where you swipe through Harshit's different role profiles to find the perfect match! ❤️";
      }
      else if (q.includes('coffee') || q.includes('support')) {
        reply = "If the portfolio impressed you, consider buying Harshit a coffee ☕ — it powers more late-night features!";
      }
      else if (q.includes('gaming') || q.includes('game')) {
        reply = "Gaming Profile has Harshit's RPG character, skills, combat system, and gaming inventory! Open it for some fun.";
      }
      else if (q.includes('terminal') || q.includes('blog') || q.includes('achievements')) {
        reply = "Got it! Use the shortcut below to open the requested app.";
      }
    } else {
      const stage = unsupportedCount;
      reply = WITTY_STAGES[Math.min(stage, WITTY_STAGES.length - 1)];
      const newCount = unsupportedCount + 1;
      setUnsupportedCount(newCount);

      // Stage 5 = self-destruct sequence
      if (stage >= 4) {
        unlockAchievement('easter_egg');
        setSelfDestructActive(true);
      }
    }

    addChatMessage('assistant', reply);
  };

  const isLight = theme === 'light';
  const chatBg = isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100';
  const footerBg = isLight ? 'bg-gray-100' : 'bg-slate-900/60 border-t border-white/5';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${chatBg} custom-scrollbar`}>
      {/* Self-Destruct Countdown Banner */}
      {selfDestructActive && countdown > 0 && (
        <div className="bg-red-900 border-b border-red-500 px-4 py-2 flex items-center justify-between animate-pulse shrink-0">
          <span className="text-red-300 text-[10px] font-black uppercase tracking-widest">⚠️ SELF-DESTRUCT ACTIVE</span>
          <span className="text-red-200 text-sm font-black font-mono">T-{countdown}s</span>
        </div>
      )}
      {/* Scrollable messages area */}
      <div 
        ref={chatContainerRef}
        className="flex-grow flex-shrink min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain custom-scrollbar"
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
      >
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
          className={`flex-grow px-3.5 py-2 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 placeholder-gray-400 ${
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
