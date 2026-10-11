import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, Linkedin, Github, CheckCircle, Phone, Copy, 
  ExternalLink, BookOpen, Database, ShieldAlert, Terminal, 
  Cpu, Check, AlertCircle, Clock, Sparkles
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { PORTFOLIO_META } from '../../data/config';
import { playNotificationSound } from '../../utils/sounds';
import { trackEvent } from '../../utils/analytics';
import { apiUrl } from '../../utils/paths';

const DESTINATION_EMAIL = PORTFOLIO_META.email;
const RATE_LIMIT_SECONDS = 30;
const STORAGE_KEY_LAST_SENT = 'portfolio_os_contact_last_sent';
const RATE_LIMITED_MESSAGE = 'Too many messages right now. Please try again in a few minutes, or email me directly.';

type SendResult = 'sent' | 'rate_limited' | 'failed';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function ContactApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme              = useOSStore((state) => state.theme);
  const addNotification    = useOSStore((state) => state.addNotification);
  const unlockAchievement  = useOSStore((state) => state.unlockAchievement);
  const globalViewMode     = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;

  // Form Fields
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Honeypot anti-spam hidden field
  const [website, setWebsite] = useState('');

  // Validation & Rate Limit
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Transmission Sequence State
  const [sending, setSending] = useState(false);
  const [sendingStep, setSendingStep] = useState<number>(0); // 0: Idle, 1: Validating, 2: Sending, 3: Waiting for server, 4: Accepted, 5: Sent
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Check rate limit timer on mount and interval
  useEffect(() => {
    const checkRateLimit = () => {
      let lastSentStr: string | null = null;
      try {
        lastSentStr = localStorage.getItem(STORAGE_KEY_LAST_SENT);
      } catch {
        lastSentStr = null;
      }
      if (lastSentStr) {
        const lastSent = parseInt(lastSentStr, 10);
        const elapsed = Math.floor((Date.now() - lastSent) / 1000);
        if (elapsed < RATE_LIMIT_SECONDS) {
          setCooldownRemaining(RATE_LIMIT_SECONDS - elapsed);
        } else {
          setCooldownRemaining(0);
        }
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (text: string, label: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
    } catch {
      addNotification('Copy failed', `Couldn't access the clipboard. ${label}: ${text}`, 'info', 'social');
      return;
    }
    addNotification('📋 Copied to Clipboard', `${label} copied!`, 'info', 'social');
    playNotificationSound();
    unlockAchievement('social_butterfly');
    if (label === 'Email') {
      trackEvent('contact_email_click', { action: 'copy' });
    }
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);

    // 1. Honeypot check
    if (website.trim() !== '') {
      console.warn('Honeypot trap triggered by bot interaction.');
      setErrorMessage('Security validation failed. Automated submissions restricted.');
      return false;
    }

    // 2. Rate limit check
    if (cooldownRemaining > 0) {
      setErrorMessage(`Rate limit active: Please wait ${cooldownRemaining}s before sending another message.`);
      return false;
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return false;
    }

    // 4. Subject validation
    if (!subject || subject.trim().length < 3) {
      setErrorMessage('Please provide a subject (at least 3 characters).');
      return false;
    }

    // 5. Message length validation
    if (!message || message.trim().length < 10) {
      setErrorMessage('Please write a message of at least 10 characters.');
      return false;
    }

    return true;
  };

  const executeResendMail = async (): Promise<SendResult> => {
    // Serverless endpoint (/api/send-email) calls the Resend API server-side
    try {
      const serverlessRes = await fetch(apiUrl('send-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (serverlessRes.ok) return 'sent';
      if (serverlessRes.status === 429) return 'rate_limited';
    } catch (apiErr) {
      console.warn('Serverless endpoint unavailable...', apiErr);
    }

    return 'failed';
  };

  // Start the local cooldown only after a message actually went out
  const startCooldown = () => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_SENT, Date.now().toString());
    } catch {
      // Storage unavailable: the in-memory countdown still applies for this session
    }
    setCooldownRemaining(RATE_LIMIT_SECONDS);
  };

  const handleRateLimited = () => {
    setSending(false);
    setSendingStep(0);
    setProgressPercent(0);
    setTerminalLogs([]);
    setErrorMessage(RATE_LIMITED_MESSAGE);
    trackEvent('contact_submit_rate_limited');
  };

  const clearForm = () => {
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      playNotificationSound();
      return;
    }

    setSending(true);
    setTerminalLogs([]);
    playNotificationSound();

    if (isMobile) {
      // ── Mobile simplified fast flow ──
      setSendingStep(1);
      setProgressPercent(30);
      setTerminalLogs(['> Sending via Resend...']);

      const result = await executeResendMail();

      if (result === 'rate_limited') {
        handleRateLimited();
        return;
      }

      if (result === 'sent') {
        startCooldown();
        clearForm();
        setProgressPercent(100);
        setSendingStep(5);
        setSuccess(true);
        setSending(false);
        addNotification('✉️ Message Sent', 'Your message was sent to Harshit.', 'success', 'career');
        playNotificationSound();
        unlockAchievement('social_butterfly');
        trackEvent('contact_submit_success', { channel: 'resend_mobile' });
      } else {
        // Fallback for mobile if offline/API fails
        setSending(false);
        setErrorMessage('Sending failed. Opening your mail app instead...');
        window.location.href = `mailto:${PORTFOLIO_META.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      }
      return;
    }

    // ── Desktop terminal-style sending log ──
    // Step 1: Validating
    setSendingStep(1);
    setProgressPercent(15);
    setTerminalLogs([
      `> Validating...`,
      `[OK] Email, subject and message look good.`,
    ]);

    await wait(500);

    // Step 2: Sending
    setSendingStep(2);
    setProgressPercent(45);
    setTerminalLogs((prev) => [
      ...prev,
      `> POST /api/send-email`,
      `> Sending via Resend...`,
    ]);

    await wait(400);

    // Step 3: Waiting for the server
    setSendingStep(3);
    setProgressPercent(75);
    setTerminalLogs((prev) => [...prev, `> Waiting for server response...`]);

    const sendResult = await executeResendMail();

    if (sendResult === 'rate_limited') {
      handleRateLimited();
      return;
    }

    await wait(300);

    if (sendResult === 'sent') {
      startCooldown();

      // Step 4: Accepted by the server
      setSendingStep(4);
      setProgressPercent(95);
      setTerminalLogs((prev) => [...prev, `[OK] Server accepted the message.`]);

      await wait(400);

      // Step 5: Sent
      setSendingStep(5);
      setProgressPercent(100);
      setTerminalLogs((prev) => [
        ...prev,
        `[OK] Recipient: ${DESTINATION_EMAIL}`,
        `✓ Message sent`,
      ]);

      await wait(400);
      setSuccess(true);
      setSending(false);
      addNotification('✉️ Message Sent', 'Your message was sent to Harshit.', 'success', 'career');
      playNotificationSound();
      unlockAchievement('social_butterfly');
      trackEvent('contact_submit_success', { channel: 'resend_desktop' });

      clearForm();
    } else {
      // Fallback handling
      setTerminalLogs((prev) => [
        ...prev,
        `[ERR] Sending failed. Opening your mail app instead...`
      ]);
      await wait(800);
      setSending(false);
      window.location.href = `mailto:${PORTFOLIO_META.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  const handleResetForm = () => {
    setSuccess(false);
    setSendingStep(0);
    setProgressPercent(0);
    setTerminalLogs([]);
    setErrorMessage(null);
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10 backdrop-blur-md';

  // ASCII/Block Progress bar generator
  const renderAsciiProgressBar = (percent: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const filled = '█'.repeat(filledBlocks);
    const empty = '░'.repeat(totalBlocks - filledBlocks);
    return `${filled}${empty}`;
  };

  return (
    <div className={`flex flex-col grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${boxBg} custom-scrollbar`}>
      {/* Header - Centered line requested */}
      <div className="text-center space-y-1 select-none flex flex-col items-center justify-center mx-auto max-w-md">
        <h2 className="text-sm font-bold tracking-wider uppercase text-purple-400 flex items-center space-x-1.5">
          <Terminal className="w-4 h-4 text-purple-400 inline" />
          <span>Contact.exe</span>
        </h2>
        <p className="text-[10px] text-gray-400 text-center">
          Establish standard mail bridges or social hooks with Harshit
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'} items-start`}>
        
        {/* Left column: Get Connected channels */}
        <div className={`${isMobile ? 'col-span-1' : 'md:col-span-1'} space-y-4`}>
          <div className={`p-5 rounded-2xl border ${cardBg} shadow-lg space-y-4`}>
            <h3 className={`text-xs font-bold border-b pb-2 flex items-center space-x-1.5 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-white/5'}`}>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Get Connected</span>
            </h3>
            
            <div className="space-y-3.5 text-xs">
              
              {/* Email Card */}
              <div className={`space-y-1.5 p-2.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-bold uppercase flex items-center space-x-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    <Mail className="w-3 h-3 text-purple-500" />
                    <span>Email Address</span>
                  </span>
                </div>
                <p className={`text-[10px] font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{PORTFOLIO_META.email}</p>
                <div className={`grid grid-cols-2 gap-1.5 pt-1.5 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                  <button 
                    onClick={() => handleCopy(PORTFOLIO_META.email, 'Email')}
                    className="py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center space-x-1 transition"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </button>
                  <a 
                    href={`mailto:${PORTFOLIO_META.email}`}
                    onClick={() => trackEvent('contact_email_click', { action: 'open' })}
                    className="py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-bold flex items-center justify-center space-x-1 text-center transition"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className={`space-y-1.5 p-2.5 rounded-xl border ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-bold uppercase flex items-center space-x-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>Phone Number</span>
                  </span>
                </div>
                <p className={`text-[10px] font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{PORTFOLIO_META.phone}</p>
                <div className={`grid grid-cols-2 gap-1.5 pt-1.5 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
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

              {/* Social profiles */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Profiles</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={PORTFOLIO_META.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('contact_linkedin_click')}
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">LinkedIn</span>
                  </a>
                  <a
                    href={PORTFOLIO_META.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-1.5 p-2 rounded-lg transition ${
                      isLight ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-gray-600/15 hover:bg-gray-600/25 text-gray-300'
                    }`}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">GitHub</span>
                  </a>
                  <a
                    href={PORTFOLIO_META.medium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-500 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Medium</span>
                  </a>
                  <a
                    href={PORTFOLIO_META.kaggle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 p-2 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Kaggle</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right column: Direct Message Form & Transmission Control */}
        <div className={isMobile ? 'col-span-1' : 'md:col-span-2'}>
          {success ? (
            /* Successful Transmission Output */
            <div className={`p-8 rounded-2xl border text-center space-y-5 flex flex-col items-center justify-center shadow-xl ${cardBg}`}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-base font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>✓ Message Sent</h3>
                <p className="text-xs text-emerald-600 font-mono font-bold">Sent to Harshit via Resend</p>
              </div>
              <p className={`text-xs leading-relaxed max-w-sm ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>
                Your message was sent to <span className="text-purple-600 font-semibold">{DESTINATION_EMAIL}</span>. Harshit will get back to you shortly.
              </p>
              <button
                onClick={handleResetForm}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/20 active:scale-95 transition"
              >
                Send another message
              </button>
            </div>
          ) : sending ? (
            /* Sending Terminal Transmission Sequence */
            <div className={`p-6 rounded-2xl border ${cardBg} shadow-xl space-y-4 font-mono`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    {isMobile ? 'Sending message...' : 'Contact.exe · sending log'}
                  </span>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress bar (ASCII block format as requested: ██████████) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>TRANS_PROGRESS</span>
                  <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="p-3 bg-black/80 rounded-xl border border-purple-500/30 text-purple-400 font-mono text-center text-sm tracking-widest shadow-inner overflow-hidden">
                  <span className="text-purple-300 select-none">
                    {renderAsciiProgressBar(progressPercent)}
                  </span>
                </div>
              </div>

              {/* Transmission Steps */}
              <div className="space-y-2 text-xs pt-1">
                <div className={`flex items-center space-x-2 transition-opacity ${sendingStep >= 1 ? 'opacity-100 text-purple-300' : 'opacity-30 text-gray-500'}`}>
                  {sendingStep > 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                  <span className="font-bold">{isMobile ? 'Sending via Resend...' : 'Validating...'}</span>
                </div>

                {!isMobile && (
                  <>
                    <div className={`flex items-center space-x-2 transition-opacity ${sendingStep >= 2 ? 'opacity-100 text-purple-300' : 'opacity-30 text-gray-500'}`}>
                      {sendingStep > 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : sendingStep === 2 ? <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                      <span className="font-bold">Sending via Resend...</span>
                    </div>

                    <div className={`flex items-center space-x-2 transition-opacity ${sendingStep >= 3 ? 'opacity-100 text-purple-300' : 'opacity-30 text-gray-500'}`}>
                      {sendingStep > 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : sendingStep === 3 ? <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                      <span className="font-bold">Waiting for server...</span>
                    </div>

                    <div className={`flex items-center space-x-2 transition-opacity ${sendingStep >= 4 ? 'opacity-100 text-purple-300' : 'opacity-30 text-gray-500'}`}>
                      {sendingStep >= 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                      <span className="font-bold">Accepted by server</span>
                    </div>
                  </>
                )}

                <div className={`flex items-center space-x-2 transition-opacity ${sendingStep >= 5 ? 'opacity-100 text-emerald-400' : 'opacity-30 text-gray-500'}`}>
                  {sendingStep === 5 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                  <span className="font-bold">✓ Message sent</span>
                </div>
              </div>

              {/* Console log display */}
              <div className="bg-slate-950/90 border border-white/10 rounded-xl p-3 text-[10px] text-gray-300 space-y-1 max-h-32 overflow-y-auto custom-scrollbar font-mono">
                {terminalLogs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : log.startsWith('[ERR]') ? 'text-rose-400' : 'text-gray-300'}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className={`p-6 rounded-2xl border ${cardBg} shadow-lg space-y-4`}>
              <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                <h3 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Mail className="w-3.5 h-3.5 text-purple-500" />
                  <span>Direct Message</span>
                </h3>
                {cooldownRemaining > 0 && (
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5 animate-spin" />
                    <span>Rate Limit: {cooldownRemaining}s</span>
                  </span>
                )}
              </div>

              {/* Validation Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Anti-Spam Honeypot Hidden Input */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-4'}`}>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700 font-extrabold' : 'text-gray-400'}`}>Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500/50 border transition ${
                      isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                    placeholder="name@domain.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700 font-extrabold' : 'text-gray-400'}`}>Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500/50 border transition ${
                      isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                    placeholder="Project Inquiry / Job Opportunity"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700 font-extrabold' : 'text-gray-400'}`}>Message * (min 10 chars)</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500/50 border transition ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                  }`}
                  placeholder="Hey Harshit, I checked out your Portfolio OS..."
                />
              </div>

              {/* Anti-spam details badge */}
              <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1 border-t border-white/5">
                <span className="flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-purple-400" />
                  <span>Spam protected (Honeypot + 30s Rate Limit)</span>
                </span>
                <span>Powered by Resend API</span>
              </div>

              <button
                type="submit"
                disabled={sending || cooldownRemaining > 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {cooldownRemaining > 0 
                    ? `Cooldown Active (${cooldownRemaining}s)` 
                    : 'Dispatch Message'}
                </span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
