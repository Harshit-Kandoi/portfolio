import React, { useState } from 'react';
import { Mail, Send, Linkedin, Github, CheckCircle } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { playNotificationSound } from '../../utils/sounds';

export default function ContactApp() {
  const theme = useOSStore((state) => state.theme);
  const addNotification = useOSStore((state) => state.addNotification);
  
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setSending(true);

    // Simulate network dispatch delay
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      addNotification('✉️ Message Dispatched', 'Your email inquiry was successfully sent to Harshit!', 'success');
      playNotificationSound();
      
      // Reset form
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-gray-150 text-gray-800' : 'bg-slate-950 text-purple-100';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-5 ${boxBg}`}>
      <div className="text-center space-y-1">
        <h2 className="text-sm font-bold tracking-wider uppercase text-purple-400">Contact.exe</h2>
        <p className="text-[10px] text-gray-400">Establish standard mail bridges or social hooks with Harshit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        
        {/* Social channels panel */}
        <div className="md:col-span-1 space-y-3.5 select-none">
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'}`}>
            <h3 className="text-xs font-bold text-white mb-2.5">Channels</h3>
            <div className="space-y-2 text-xs">
              <a
                href="https://linkedin.com/in/harshit-kandoi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition"
              >
                <Linkedin className="w-4 h-4 shrink-0" />
                <span className="font-semibold">LinkedIn Profile</span>
              </a>
              <a
                href="https://github.com/Harshit-Kandoi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-600/15 hover:bg-gray-600/25 text-gray-300 transition"
              >
                <Github className="w-4 h-4 shrink-0" />
                <span className="font-semibold">GitHub Profile</span>
              </a>
              <a
                href="mailto:harshit.kandoi@outlook.com"
                className="flex items-center space-x-2 p-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 transition"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Direct Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2">
          {success ? (
            <div className={`p-6 rounded-xl border text-center space-y-3 flex flex-col items-center justify-center ${
              isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'
            }`}>
              <CheckCircle className="w-12 h-12 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Message Transmitted!</h3>
              <p className="text-xs text-gray-400 leading-normal max-w-xs">
                Thanks for reaching out! Harshit will receive the transmission directly and respond to your email shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : ''
                    }`}
                    placeholder="name@domain.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : ''
                    }`}
                    placeholder="Job Inquiry / Coffee chat"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 ${
                    isLight ? 'bg-white border-gray-200 text-gray-800' : ''
                  }`}
                  placeholder="Hey Harshit, I saw your portfolio OS..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition"
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
