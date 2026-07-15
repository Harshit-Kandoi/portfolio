import React, { useState } from 'react';
import { Mail, Send, Linkedin, Github, CheckCircle, Phone, Copy, ExternalLink, BookOpen, Database } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { PORTFOLIO_META } from '../../data/config';
import { playNotificationSound } from '../../utils/sounds';

export default function ContactApp() {
  const theme              = useOSStore((state) => state.theme);
  const addNotification    = useOSStore((state) => state.addNotification);
  const unlockAchievement  = useOSStore((state) => state.unlockAchievement);
  
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('📋 Copied to Clipboard', `${label} copied!`, 'info', 'social');
    playNotificationSound();
    unlockAchievement('social_butterfly');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setSending(true);

    // Simulate network dispatch delay
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      addNotification('✉️ Message Dispatched', 'Your email inquiry was successfully sent to Harshit!', 'success', 'career');
      playNotificationSound();
      
      // Reset form
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100';
  const cardBg = isLight ? 'bg-white border-gray-250' : 'bg-white/5 border-white/10 backdrop-blur-md';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${boxBg} custom-scrollbar`}>
      <div className="text-center space-y-1 select-none">
        <h2 className="text-sm font-bold tracking-wider uppercase text-purple-400">Contact.exe</h2>
        <p className="text-[10px] text-gray-400">Establish standard mail bridges or social hooks with Harshit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Get Connected channels panel */}
        <div className="md:col-span-1 space-y-4">
          <div className={`p-5 rounded-2xl border ${cardBg} shadow-lg space-y-4`}>
            <h3 className="text-xs font-bold text-white border-b border-white/5 pb-2">Get Connected</h3>
            
            <div className="space-y-3.5 text-xs">
              
              {/* Email */}
              <div className="space-y-1.5 p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-450 uppercase flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-purple-400" />
                    <span>Email Address</span>
                  </span>
                </div>
                <p className="text-[10px] font-bold text-white truncate">{PORTFOLIO_META.email}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/5">
                  <button 
                    onClick={() => handleCopy(PORTFOLIO_META.email, 'Email')}
                    className="py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center space-x-1 transition"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </button>
                  <a 
                    href={`mailto:${PORTFOLIO_META.email}`}
                    className="py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center space-x-1 text-center transition"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5 p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-450 uppercase flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Phone Number</span>
                  </span>
                </div>
                <p className="text-[10px] font-bold text-white truncate">{PORTFOLIO_META.phone}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/5">
                  <button 
                    onClick={() => handleCopy(PORTFOLIO_META.phone, 'Phone')}
                    className="py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center space-x-1 transition"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </button>
                  <a 
                    href={`tel:${PORTFOLIO_META.phone}`}
                    className="py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center space-x-1 text-center transition"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>

              {/* Social links grid */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Profiles</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={PORTFOLIO_META.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">LinkedIn</span>
                  </a>
                  <a
                    href={PORTFOLIO_META.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-gray-600/15 hover:bg-gray-600/25 text-gray-300 transition"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">GitHub</span>
                  </a>
                  <a
                    href={PORTFOLIO_META.medium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Medium</span>
                  </a>
                  <a
                    href={PORTFOLIO_META.kaggle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Kaggle</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2">
          {success ? (
            <div className={`p-8 rounded-2xl border text-center space-y-4 flex flex-col items-center justify-center shadow-lg ${cardBg}`}>
              <CheckCircle className="w-12 h-12 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Message Transmitted!</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                Thanks for reaching out! Harshit will receive the transmission directly and respond to your email shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border ${cardBg} shadow-lg space-y-4`}>
              <h3 className="text-xs font-bold text-white border-b border-white/5 pb-2">Direct Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 placeholder-gray-400 ${
                      isLight ? 'bg-white border-gray-250 text-gray-800' : ''
                    }`}
                    placeholder="name@domain.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 placeholder-gray-400 ${
                      isLight ? 'bg-white border-gray-255 text-gray-800' : ''
                    }`}
                    placeholder="Job Inquiry / Coffee chat"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 placeholder-gray-400 ${
                    isLight ? 'bg-white border-gray-250 text-gray-800' : ''
                  }`}
                  placeholder="Hey Harshit, I saw your portfolio OS..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-purple-650 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-md shadow-purple-500/10"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Transmitting...' : 'Dispatch Message'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
