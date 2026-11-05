import React, { useState } from 'react';
import { Bot, Key, CheckCircle2, AlertTriangle, RefreshCw, X, ExternalLink, HelpCircle } from 'lucide-react';
import { BotInstance } from '../types';

interface ConnectBotModalProps {
  onClose: () => void;
  onConnectBot: (token: string, category: BotInstance['category'], hostProvider: string, renderHook: string) => Promise<{ success: boolean; bot?: BotInstance; error?: string }>;
}

export const ConnectBotModal: React.FC<ConnectBotModalProps> = ({ onClose, onConnectBot }) => {
  const [token, setToken] = useState('');
  const [category, setCategory] = useState<BotInstance['category']>('UTILITY');
  const [hostProvider, setHostProvider] = useState<'RENDER' | 'HEROKU' | 'VPS' | 'OTHER'>('RENDER');
  const [renderHook, setRenderHook] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedBot, setConnectedBot] = useState<BotInstance | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setError(null);
    setIsLoading(true);

    const res = await onConnectBot(token.trim(), category, hostProvider, renderHook.trim());

    if (res.success && res.bot) {
      setConnectedBot(res.bot);
    } else {
      setError(res.error || 'Telegram Bot tokenini tekshirib bo‘lmadi. Token to‘g‘riligini tekshiring.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Yangi Telegram Botni Ulash (Real API)</h3>
              <p className="text-xs text-slate-400">
                BotFather API Token orqali real Telegram botingizni integratsiya qiling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {connectedBot ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Bot Muvaffaqiyatli Ulandi!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Telegram serverlari bilan aloqa o‘rnatildi va panelga qo‘shildi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Bot Nomi:</span>
                <strong className="text-white font-sans">{connectedBot.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telegram Handle:</span>
                <strong className="text-cyan-400">{connectedBot.handle}</strong>
              </div>
              {connectedBot.botId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bot ID:</span>
                  <span className="text-slate-200">{connectedBot.botId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Holat:</span>
                <span className="text-emerald-400 font-bold">{connectedBot.status}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md cursor-pointer transition-all"
            >
              Tayyor • Panelga Qaytish
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">
                Telegram Bot Token (HTTP API Token):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-sans mt-1 block">
                Telegramdagi <code className="text-cyan-400 font-mono">@BotFather</code> dan olingan rasmiy API token.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">
                Bot Kategoriyasi:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              >
                <option value="UTILITY">Utility / Xizmatlar Boti</option>
                <option value="FINANCE">Finance / To‘lovlar Boti</option>
                <option value="COMMUNITY">Community / Guruh & Moderatsiya</option>
                <option value="AI_ASSISTANT">AI Assistant / Sun'iy Intellekt</option>
                <option value="MONITORING">Monitoring / Bildirishnomalar</option>
              </select>
              {hostProvider === 'RENDER' && (
                <div className="mt-3">
                  <label className="text-slate-300 font-sans font-semibold block mb-1">
                    Render Deploy Hook URL:
                  </label>
                  <input
                    type="text"
                    value={renderHook}
                    onChange={(e) => setRenderHook(e.target.value)}
                    placeholder="https://api.render.com/deploy/hook_..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-sans text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                Tokenni qayerdan olish mumkin?
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[10px]">
                <li>Telegramda <strong>@BotFather</strong> botini oching.</li>
                <li><code>/newbot</code> buyrug‘ini yuborib yangi bot yarating yoki mavjud botingizni tanlang.</li>
                <li>Berilgan HTTP API tokenni nusxalab yuqoridagi maydonga kiriting.</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-1 font-sans">
              <button
                type="submit"
                disabled={isLoading || !token.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Telegram Serverlarida Tekshirilmoqda...' : 'Tekshirish & Botni Ulash'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
