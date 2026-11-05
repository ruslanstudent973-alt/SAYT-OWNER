import React, { useState } from 'react';
import { Globe, RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { AppInstance, AppProvider, AppType } from '../types';

interface ConnectWebsiteModalProps {
  onClose: () => void;
  onConnectApp: (url: string, name: string, provider: AppProvider, type: AppType) => Promise<{ success: boolean; app?: AppInstance; error?: string }>;
}

export const ConnectWebsiteModal: React.FC<ConnectWebsiteModalProps> = ({ onClose, onConnectApp }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<AppProvider>('CUSTOM');
  const [type, setType] = useState<AppType>('WEB_APP');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setIsLoading(true);

    const res = await onConnectApp(url.trim(), name.trim(), provider, type);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Saytni tekshirib bo‘lmadi.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Yangi Sayt / Web Appni Ulash</h3>
              <p className="text-xs text-slate-400">
                URL manzil orqali real HTTP monitoring va SSL sertifikat nazorati
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Sayt yoki API URL Manzili (HTTPS):
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://mysite.com yoki https://api.myproject.io"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Ko‘rinadigan Nomi (Ixtiyoriy):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Asosiy Portal, API Gateway..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Xizmat Turi:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="WEB_APP">Web Dastur</option>
                <option value="WEBSITE">Statik Sayt</option>
                <option value="API">Backend API</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Xosting / Server:</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="CUSTOM">Custom VPS / Server</option>
                <option value="VERCEL">Vercel</option>
                <option value="RENDER">Render</option>
                <option value="CLOUDFLARE">Cloudflare</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Saytga Ping Yuborilmoqda...' : 'Ping Yuborish & Saqlash'}
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
      </div>
    </div>
  );
};
