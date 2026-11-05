import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

interface LoginGateModalProps {
  onLogin: (identifier: string, code: string) => { success: boolean; message?: string };
}

export const LoginGateModal: React.FC<LoginGateModalProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('8295677952');
  const [code, setCode] = useState('2011');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = onLogin(identifier, code);
      if (!res.success) {
        setError(res.message || 'Kirish rad etildi. Telegram ID yoki Maxfiy kod noto‘g‘ri.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickFillOwner = () => {
    setIdentifier('8295677952');
    setCode('2011');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-cyan-950/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Mission Control Hub • Kirish Portali
          </h2>
          <p className="text-xs text-slate-400">
            Faqat tasdiqlangan <strong>Owner</strong> va <strong>Adminlar</strong> uchun himoyalangan tizim
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1.5">
              Telegram Admin ID yoki Username:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="8295677952 yoki XRemperior"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">
              Owner Telegram ID: <code className="text-cyan-400">8295677952</code> (Username: <code className="text-cyan-400">@XRemperior</code>)
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1.5">
              Xavfsizlik Kori (Access Passcode):
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kod (masalan: 2011)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 text-center tracking-widest text-base"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 cursor-pointer transition-all disabled:opacity-50"
          >
            {isLoading ? (
              'Tekshirilmoqda...'
            ) : (
              <>
                Tizimga Kirish (Authorize)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Owner credentials button */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleQuickFillOwner}
            className="text-[11px] text-slate-400 hover:text-amber-400 font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Owner sifatida avtomatik to‘ldirish (Xayrullayev Ruslan)
          </button>
        </div>
      </div>
    </div>
  );
};
