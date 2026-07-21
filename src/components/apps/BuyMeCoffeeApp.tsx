import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { PORTFOLIO_META } from '../../data/config';
import { Coffee, Heart, Zap, Star, ExternalLink, CheckCircle, Sparkles, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import { openRazorpayCheckout } from '../../utils/razorpay';

interface CoffeeItem {
  id: string;
  name: string;
  price: string;
  usdAmount: number;
  emoji: string;
  desc: string;
  color: string;
}

const COFFEE_ITEMS: CoffeeItem[] = [
  { id: 'espresso', name: 'Espresso Shot',       price: '$1',  usdAmount: 1,  emoji: '☕', desc: 'Fuel one debug session',              color: 'from-amber-700 to-yellow-600' },
  { id: 'latte',    name: 'Large Latte',          price: '$3',  usdAmount: 3,  emoji: '🥛', desc: 'Powers half a feature build',         color: 'from-amber-500 to-orange-400' },
  { id: 'cold',     name: 'Cold Brew Special',    price: '$5',  usdAmount: 5,  emoji: '🧊', desc: 'Fuels an entire weekend sprint',       color: 'from-sky-600 to-cyan-400' },
  { id: 'pack',     name: 'Monthly Coffee Pack',  price: '$10', usdAmount: 10, emoji: '📦', desc: 'Keeps the commits flowing all month', color: 'from-purple-600 to-indigo-500' },
];

const THANKS_MESSAGES = [
  '🙏 That means the world! Every coffee = one more feature.',
  '❤️ You\'re amazing! Deploying gratitude to production...',
  '☕ Coffee received! Debugging motivation: 100%.',
  '🚀 Fueled and ready for deployment. Thank you!',
];

export default function BuyMeCoffeeApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const addNotification   = useOSStore((s) => s.addNotification);
  const unlockAchievement = useOSStore((s) => s.unlockAchievement);

  const [selected, setSelected] = useState<CoffeeItem | null>(null);
  const [done, setDone] = useState(false);
  const [custom, setCustom] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [totalCoffees, setTotalCoffees] = useState(0);

  // Dynamic Live Exchange Rate State (defaults to 87 INR fallback)
  const [exchangeRate, setExchangeRate] = useState<number>(87);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(true);

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isLight = theme === 'light';
  const bg = isLight
    ? 'bg-gradient-to-b from-amber-50 to-orange-50 text-gray-800'
    : 'bg-gradient-to-b from-slate-950 via-amber-950/5 to-slate-950 text-white';

  // Fetch Live USD to INR exchange rate & round to ceiling (higher side)
  useEffect(() => {
    let isMounted = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.rates?.INR) {
          const rawRate = Number(data.rates.INR);
          // Round off to the higher side (ceiling)
          const roundedRate = Math.ceil(rawRate);
          setExchangeRate(roundedRate);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live exchange rate, using fallback rate:', err);
      })
      .finally(() => {
        if (isMounted) setIsRateLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const getSelectedUsdAmount = (): number => {
    if (selected) {
      return selected.usdAmount;
    }
    if (custom) {
      const parsed = parseInt(custom, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 1;
  };

  const selectedUsd = getSelectedUsdAmount();
  const amountInInr = selectedUsd * exchangeRate;

  const getAmountInPaise = (): number => {
    // Math.ceil(rate) * USD * 100 paise
    return Math.max(100, selectedUsd * exchangeRate * 100);
  };

  const amountText = selected ? selected.price : custom ? `$${custom}` : '$1';

  const handleRazorpayPayment = async () => {
    if (!selected && !custom) return;
    const amountInPaise = getAmountInPaise();
    setIsProcessing(true);
    setErrorMsg(null);

    const userEmail = email.trim() || 'supporter@example.com';
    const userNote = note.trim() || 'Loved your portfolio!';

    trackEvent('coffee_support_click', { price: amountText, amount_paise: amountInPaise });

    await openRazorpayCheckout({
      amountInPaise,
      currency: 'INR',
      name: 'Harshit Kandoi',
      description: `Coffee Support: ${selected ? selected.name : 'Custom Contribution'} ($${selectedUsd} ≈ ₹${amountInInr})`,
      notes: {
        supporter_email: userEmail,
        supporter_note: userNote,
        tier: selected ? selected.name : 'Custom Amount',
      },
      prefill: {
        name: 'Portfolio Supporter',
        email: userEmail,
      },
      onSuccess: (details) => {
        setIsProcessing(false);
        setDone(true);
        setTotalCoffees((c) => c + 1);
        addNotification(
          '☕ Razorpay Payment Verified!',
          `Payment ID: ${details.paymentId}`,
          'success',
          'funny'
        );
        unlockAchievement('coffee_lover');

        // Dispatch background email notification to Harshit
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            subject: `☕ Coffee Contribution: ${amountText} (₹${amountInInr.toLocaleString('en-IN')})`,
            message: `You received a coffee support contribution!\n\nTier: ${selected ? selected.name : 'Custom Contribution'}\nAmount: ${amountText} (₹${amountInInr.toLocaleString('en-IN')} INR)\nPayment ID: ${details.paymentId}\nSupporter Email: ${userEmail}\n\nPersonal Note:\n"${userNote}"`,
          }),
        }).catch((err) => {
          console.warn('Background email dispatch failed:', err);
        });
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMsg(err);
        addNotification('❌ Payment Error', err, 'error', 'system');
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  const thankMsg = THANKS_MESSAGES[totalCoffees % THANKS_MESSAGES.length];

  if (done) {
    return (
      <div className={`flex flex-col flex-grow h-full items-center justify-center p-8 space-y-6 text-center ${bg}`}>
        <div className="relative">
          <div className="text-7xl animate-bounce">☕</div>
          <div className="absolute -top-2 -right-2 text-3xl animate-spin">✨</div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-amber-400">Thank You!</h2>
          <p className="text-sm opacity-70 max-w-xs leading-relaxed">{thankMsg}</p>
        </div>
        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-300 font-bold">Productivity +{totalCoffees * 15}%</span>
        </div>
        <button
          onClick={() => { setDone(false); setSelected(null); setNote(''); setCustom(''); setEmail(''); setErrorMsg(null); }}
          className="text-[11px] text-gray-500 hover:text-white transition underline"
        >
          Buy Another Coffee
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto custom-scrollbar ${bg}`}>
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 p-6 text-center text-white shrink-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative space-y-3.5">
          <div className="flex items-center justify-center space-x-2">
            <Coffee className="w-6 h-6" />
            <h1 className="text-xl font-black">Buy Me a Coffee</h1>
          </div>
          
          {/* Subtitle Alignment */}
          <p className="text-xs text-white/95 max-w-xs mx-auto leading-snug text-center font-medium">
            Enjoyed exploring this portfolio?<br />
            Fuel the next feature with a coffee ☕
          </p>

          {/* Live USD to INR Rate Indicator */}
          <div className="inline-flex items-center justify-center space-x-1.5 text-[10px] bg-black/25 backdrop-blur-md rounded-full px-3.5 py-1 text-amber-100 font-semibold border border-white/20 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
            <span>Live Rate: 1 USD ≈ ₹{exchangeRate} INR</span>
            <span className="opacity-70 text-[9px] font-normal">(Rounded up)</span>
          </div>

          {/* Powered by Razorpay with Orange Accent Heart */}
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-white/90 pt-0.5 font-medium">
            <Heart className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse shrink-0" />
            <span>Powered by Razorpay Standard Checkout</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start space-x-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Payment Error</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Coffee Options */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-3">Choose Your Contribution</p>
          <div className="grid grid-cols-2 gap-3">
            {COFFEE_ITEMS.map((item) => {
              const itemInr = item.usdAmount * exchangeRate;
              const isSelected = selected?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelected(item);
                    setCustom('');
                    setErrorMsg(null);
                    trackEvent('coffee_select', { tier_id: item.id, price: item.price });
                  }}
                  className={`rounded-2xl p-3.5 text-left border transition-all duration-200 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/12 shadow-[0_0_18px_rgba(245,158,11,0.22)] scale-[1.01]'
                      : isLight
                      ? 'border-gray-200 bg-white hover:border-amber-300 hover:scale-[1.005]'
                      : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5 hover:scale-[1.005]'
                  } active:scale-[0.98]`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{item.emoji}</span>
                    {isSelected && <CheckCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 animate-in fade-in zoom-in-75 duration-150" />}
                  </div>

                  {/* Option A Stacked Price Display with Increased USD Hierarchy */}
                  <div className="flex flex-col mb-1.5">
                    <span className={`text-base font-black leading-none bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.price}
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-bold mt-1 tracking-tight">
                      ≈ ₹{itemInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs font-bold leading-tight mt-1">{item.name}</p>
                  <p className="text-[9.5px] opacity-55 leading-tight mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Custom Amount</p>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm text-gray-400 font-bold">$</span>
            <input
              type="number"
              min="1"
              max="999"
              placeholder="11"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); setErrorMsg(null); }}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium ${
                isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Your Email (Optional)</p>
          <input
            type="email"
            placeholder="supporter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 ${
              isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
            }`}
          />
        </div>

        {/* Personal Note */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Leave a Note (Optional)</p>
          <textarea
            rows={2}
            placeholder="Loved your portfolio! Keep building awesome things 🚀"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-amber-400 ${
              isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
            }`}
          />
        </div>

        {/* Personal Touch / Warm Playful Sentence */}
        <div className={`p-3.5 rounded-xl border text-center text-[11px] leading-relaxed ${
          isLight ? 'bg-amber-500/5 border-amber-500/15 text-amber-900/80' : 'bg-white/3 border-white/8 text-amber-200/80'
        }`}>
          <p className="italic">
            "No pressure at all — browsing this portfolio already made my day! Coffee just keeps the commits flowing at 2 AM. ☕"
          </p>
        </div>

        {/* Razorpay Checkout CTA (Uncluttered) */}
        <button
          onClick={handleRazorpayPayment}
          disabled={(!selected && !custom) || isProcessing}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-sm py-3.5 rounded-2xl hover:opacity-90 transition active:scale-[0.98] disabled:opacity-40 flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Initializing Razorpay...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Pay {amountText} (₹{amountInInr.toLocaleString('en-IN')}) ☕</span>
            </>
          )}
        </button>

        {/* External Link */}
        <a
          href={PORTFOLIO_META.buymecoffee}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-500 hover:text-amber-400 transition"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Or visit buymeacoffee.com/Harshit_Kandoi directly</span>
        </a>

        {/* Stats Footer with Polished Badge */}
        <div className={`flex items-center justify-center space-x-4 text-[9px] opacity-40 pt-2 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
          <div className="flex items-center space-x-1"><Star className="w-3 h-3 text-amber-400" /><span>Secure Checkout</span></div>
          <div className="flex items-center space-x-1"><Zap className="w-3 h-3 text-purple-400" /><span>HMAC SHA256 Verified</span></div>
        </div>
      </div>
    </div>
  );
}
