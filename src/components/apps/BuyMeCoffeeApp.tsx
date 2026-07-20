import React, { useState } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { PORTFOLIO_META } from '../../data/config';
import { Coffee, Heart, Zap, Star, ExternalLink, CheckCircle, Sparkles, CreditCard, Lock, ArrowLeft, Smartphone } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

interface CoffeeItem {
  id: string;
  name: string;
  price: string;
  emoji: string;
  desc: string;
  color: string;
}

const COFFEE_ITEMS: CoffeeItem[] = [
  { id: 'espresso', name: 'Espresso Shot',       price: '$1',  emoji: '☕', desc: 'Fuel one debug session',              color: 'from-amber-700 to-yellow-600' },
  { id: 'latte',    name: 'Large Latte',          price: '$3',  emoji: '🥛', desc: 'Powers half a feature build',         color: 'from-amber-500 to-orange-400' },
  { id: 'cold',     name: 'Cold Brew Special',    price: '$5',  emoji: '🧊', desc: 'Fuels an entire weekend sprint',       color: 'from-sky-600 to-cyan-400'     },
  { id: 'pack',     name: 'Monthly Coffee Pack',  price: '$10', emoji: '📦', desc: 'Keeps the commits flowing all month', color: 'from-purple-600 to-indigo-500' },
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
  const [note, setNote] = useState('');
  const [totalCoffees, setTotalCoffees] = useState(0);

  // Payment states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'apple' | 'paypal' | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing'>('select');
  const [processingMsg, setProcessingMsg] = useState('');
  const [mockCard, setMockCard] = useState({ number: '4111 2222 3333 4444', expiry: '12/28', cvv: '123' });
  const [mockUpi, setMockUpi] = useState('recruiter@gpay');

  const isLight = theme === 'light';
  const bg = isLight
    ? 'bg-gradient-to-b from-amber-50 to-orange-50 text-gray-800'
    : 'bg-gradient-to-b from-slate-950 via-amber-950/5 to-slate-950 text-white';

  const handleBuy = () => {
    if (!selected && !custom) return;
    const finalAmount = selected ? selected.price : `$${custom}`;
    trackEvent('coffee_support_click', { price: finalAmount });
    setShowPayment(true);
    setPaymentMethod('card'); // default select
    setPaymentStep('select');
  };

  const startPaymentSequence = () => {
    setPaymentStep('processing');
    
    const steps = [
      { text: 'Establishing secure mock gateway connection...', delay: 0 },
      { text: 'Encrypting payload via AES-256-GCM...', delay: 550 },
      { text: 'Waiting for mock bank authorization...', delay: 1100 },
      { text: 'Transacting simulated coffee points...', delay: 1700 },
      { text: 'Success! Coffee fuel dispatched to Harshit...', delay: 2200 },
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setProcessingMsg(s.text);
      }, s.delay);
    });

    setTimeout(() => {
      setShowPayment(false);
      setDone(true);
      setTotalCoffees((c) => c + 1);
      addNotification('☕ Coffee Dispatched!', 'Mock payment authorized. Thank you!', 'success', 'funny');
      unlockAchievement('coffee_lover');
    }, 2800);
  };

  const amountText = selected ? selected.price : `$${custom}`;

  const thankMsg = THANKS_MESSAGES[totalCoffees % THANKS_MESSAGES.length];

  if (showPayment) {
    return (
      <div className={`flex flex-col flex-grow h-full overflow-y-auto custom-scrollbar p-6 ${bg}`}>
        {/* Header */}
        <div className="flex items-center space-x-2 pb-4 border-b border-white/5 shrink-0">
          <button 
            onClick={() => setShowPayment(false)}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Mock Checkout</span>
          </div>
        </div>

        {paymentStep === 'select' ? (
          <div className="flex-grow flex flex-col justify-between pt-5 space-y-6">
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Fuel Order</p>
                  <h3 className="text-xs font-bold text-white mt-0.5">{selected ? selected.name : 'Custom Support'}</h3>
                </div>
                <span className="text-lg font-black text-amber-400">{amountText}</span>
              </div>

              {/* Payment Methods Choice */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'upi', label: 'UPI Payment', icon: Smartphone },
                    { id: 'apple', label: 'Apple Pay', icon: Star },
                  ].map((m) => {
                    const isSel = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as 'card' | 'upi' | 'apple' | 'paypal')}
                        className={`p-3 rounded-xl border flex items-center space-x-2 transition text-left text-xs font-bold ${
                          isSel 
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10' 
                            : 'bg-white/3 border-white/5 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        <m.icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method Forms */}
              {paymentMethod === 'card' && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Card Number</label>
                    <input 
                      type="text" 
                      value={mockCard.number} 
                      onChange={(e) => setMockCard({ ...mockCard, number: e.target.value })}
                      className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Expiry</label>
                      <input 
                        type="text" 
                        value={mockCard.expiry} 
                        onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">CVV</label>
                      <input 
                        type="password" 
                        value={mockCard.cvv} 
                        onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value })}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">UPI Address (VPA)</label>
                    <input 
                      type="text" 
                      value={mockUpi} 
                      onChange={(e) => setMockUpi(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 italic leading-snug">Simulates instant transfer from Google Pay / PhonePe wallet.</p>
                </div>
              )}

              {paymentMethod === 'apple' && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center py-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm mx-auto shadow-md"></div>
                  <p className="text-xs font-bold text-white">Apple Pay Active</p>
                  <p className="text-[9.5px] text-gray-500">Fast one-click authorization using Touch ID / Face ID simulation.</p>
                </div>
              )}
            </div>

            <button
              onClick={startPaymentSequence}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Pay {amountText} Now
            </button>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-6 text-center">
            {/* Spinning Loader */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/25 border-t-amber-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-purple-500/10 border-b-purple-500 animate-spin duration-1000" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-white tracking-wide animate-pulse">Processing Transaction...</p>
              <p className="text-[10px] text-gray-500 font-mono leading-relaxed max-w-xs">{processingMsg}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

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
          onClick={() => { setDone(false); setSelected(null); setNote(''); setCustom(''); }}
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
        <div className="relative space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Coffee className="w-6 h-6" />
            <h1 className="text-xl font-black">Buy Me a Coffee</h1>
          </div>
          <p className="text-[11px] text-white/80 max-w-xs mx-auto leading-relaxed">
            If this portfolio impressed you, consider fueling the developer behind it ☕
          </p>
          <div className="flex items-center justify-center space-x-1 text-[10px] text-white/70">
            <Heart className="w-3 h-3 fill-white text-white" />
            <span>Support open-source & indie dev</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Coffee Options */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-3">Choose Your Contribution</p>
          <div className="grid grid-cols-2 gap-3">
            {COFFEE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setCustom('');
                  trackEvent('coffee_select', { tier_id: item.id, price: item.price });
                }}
                className={`rounded-2xl p-3 text-left border transition active:scale-95 ${
                  selected?.id === item.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : isLight
                    ? 'border-gray-200 bg-white hover:border-amber-300'
                    : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-2xl">{item.emoji}</span>
                  {selected?.id === item.id && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
                <p className={`text-xs font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.price}</p>
                <p className="text-[11px] font-bold leading-tight mt-0.5">{item.name}</p>
                <p className="text-[9px] opacity-50 leading-tight mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">Or Custom Amount</p>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-bold">$</span>
            <input
              type="number"
              min="1"
              max="999"
              placeholder="Enter amount..."
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
              className={`w-full pl-7 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">Leave a Note (Optional)</p>
          <textarea
            rows={2}
            placeholder="Say something nice..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-amber-400 ${
              isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
            }`}
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleBuy}
          disabled={!selected && !custom}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-sm py-3 rounded-2xl hover:opacity-90 transition active:scale-95 disabled:opacity-40 flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Send {selected ? `${selected.price} Coffee` : custom ? `$${custom} Coffee` : 'Coffee'} ☕</span>
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

        {/* Stats Footer */}
        <div className={`flex items-center justify-center space-x-4 text-[9px] opacity-40 pt-2 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
          <div className="flex items-center space-x-1"><Star className="w-3 h-3 text-amber-400" /><span>100% goes to dev fuel</span></div>
          <div className="flex items-center space-x-1"><Zap className="w-3 h-3 text-purple-400" /><span>Instant productivity boost</span></div>
        </div>
      </div>
    </div>
  );
}
