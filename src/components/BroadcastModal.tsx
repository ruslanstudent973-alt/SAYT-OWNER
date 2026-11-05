import React, { useState } from 'react';
import { Radio, Send, CheckCircle2, AlertCircle, X, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { BotInstance, BroadcastDraft } from '../types';

interface BroadcastModalProps {
  bots: BotInstance[];
  initialBotId?: string;
  onClose: () => void;
  onSendBroadcast: (draft: BroadcastDraft) => { totalRecipients: number; botCount: number };
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  bots,
  initialBotId,
  onClose,
  onSendBroadcast,
}) => {
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>(
    initialBotId ? [initialBotId] : bots.map((b) => b.id)
  );
  const [audience, setAudience] = useState<'ALL' | 'ACTIVE_24H' | 'PREMIUM'>('ALL');
  const [parseMode, setParseMode] = useState<'HTML' | 'MARKDOWN' | 'PLAIN'>('HTML');
  const [message, setMessage] = useState(
    '🚀 <b>Infrastructure Update</b>\n\nAll automated settlement nodes and payment webhooks are running at 100% capacity. Zero downtime guaranteed.'
  );
  const [includeButton, setIncludeButton] = useState(true);
  const [buttonText, setButtonText] = useState('Open Protocol App');
  const [buttonUrl, setButtonUrl] = useState('https://app.nexusprotocol.finance');

  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sentResult, setSentResult] = useState<{ totalRecipients: number; botCount: number } | null>(
    null
  );

  const toggleBotSelection = (botId: string) => {
    setSelectedBotIds((prev) =>
      prev.includes(botId) ? prev.filter((id) => id !== botId) : [...prev, botId]
    );
  };

  const selectedBots = bots.filter((b) => selectedBotIds.includes(b.id));
  const estimatedAudience = selectedBots.reduce((sum, b) => {
    if (audience === 'ACTIVE_24H') return sum + Math.round(b.activeUsers * 0.42);
    if (audience === 'PREMIUM') return sum + Math.round(b.activeUsers * 0.15);
    return sum + b.activeUsers;
  }, 0);

  const handleSend = () => {
    if (selectedBotIds.length === 0 || !message.trim()) return;

    setIsSending(true);
    setSendProgress(15);

    setTimeout(() => setSendProgress(45), 400);
    setTimeout(() => setSendProgress(80), 800);
    setTimeout(() => {
      setSendProgress(100);
      const res = onSendBroadcast({
        botIds: selectedBotIds,
        audience,
        message,
        parseMode,
        includeButton,
        buttonText,
        buttonUrl,
      });
      setSentResult(res);
      setIsSending(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cross-Bot Mass Announcement Dispatcher</h3>
              <p className="text-xs text-slate-400">
                Broadcast notifications across connected Telegram userbases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentResult ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Broadcast Dispatched Successfully!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Delivered across <strong className="text-cyan-400">{sentResult.botCount} Telegram bots</strong> to an estimated audience of{' '}
              <strong className="text-emerald-400">{sentResult.totalRecipients.toLocaleString()} active users</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
            >
              Done & Return to Fleet
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Target Bots Selection */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Target Telegram Bots ({selectedBotIds.length} selected):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bots.map((bot) => {
                  const isChecked = selectedBotIds.includes(bot.id);
                  return (
                    <button
                      key={bot.id}
                      type="button"
                      onClick={() => toggleBotSelection(bot.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{bot.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{bot.handle}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {bot.activeUsers.toLocaleString()} users
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audience Segment & Parse Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Opted-in Users (100%)</option>
                  <option value="ACTIVE_24H">Active in Past 24 Hours (~42%)</option>
                  <option value="PREMIUM">VIP / Premium Tier Subscribers (~15%)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Telegram Formatting</label>
                <select
                  value={parseMode}
                  onChange={(e) => setParseMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="HTML">HTML (e.g. &lt;b&gt;, &lt;code&gt;)</option>
                  <option value="MARKDOWN">MarkdownV2 (*bold*, `code`)</option>
                  <option value="PLAIN">Plain Text (No parsing)</option>
                </select>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Message Text</label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {message.length} / 4096 chars
                </span>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Optional Inline Button */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeButton}
                  onChange={(e) => setIncludeButton(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span className="text-slate-300 font-semibold text-xs">
                  Include Telegram Inline URL Button
                </span>
              </label>

              {includeButton && (
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Button Text"
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Audience Summary Box */}
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Estimated Reach:</span>
              </div>
              <span className="font-mono font-bold text-indigo-300 text-sm">
                ~{estimatedAudience.toLocaleString()} users
              </span>
            </div>

            {/* Sending Progress Bar */}
            {isSending && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-cyan-400 font-mono">
                  <span>Dispatching Telegram rate-limited chunks...</span>
                  <span>{sendProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${sendProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSending || selectedBotIds.length === 0}
                onClick={handleSend}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Transmitting Broadcast...' : 'Transmit Broadcast to Telegram'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
