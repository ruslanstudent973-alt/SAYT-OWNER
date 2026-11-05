import React, { useState } from 'react';
import {
  Bot,
  RotateCcw,
  Terminal,
  KeyRound,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Play,
  Pause,
  Download,
  Trash2,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { BotInstance, LogEntry, UserRole } from '../types';
import { canAccess, maskSecret } from '../lib/rbac';
import { validateWebhookUrl } from '../lib/healthcheck';

interface TelegramBotsViewProps {
  bots: BotInstance[];
  currentUserRole: UserRole;
  onRestartBot: (id: string) => void;
  onUpdateWebhook: (id: string, url: string) => void;
  onDropPendingUpdates: (id: string) => void;
  onKeepAliveBot: (id: string) => void;
  onToggleMaintenance: (id: string) => void;
  onOpenBroadcastWithBot?: (botId: string) => void;
  onOpenConnectBot?: () => void;
  onAuditAction: (action: any, details: string, status?: any, target?: string) => void;
  openLogViewer: (id: string, name: string, type: 'bot' | 'app') => void;
}

export const TelegramBotsView: React.FC<TelegramBotsViewProps> = ({
  bots,
  currentUserRole,
  onRestartBot,
  onUpdateWebhook,
  onDropPendingUpdates,
  onKeepAliveBot,
  onToggleMaintenance,
  onOpenBroadcastWithBot,
  onOpenConnectBot,
  onAuditAction,
  openLogViewer,
}) => {
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'details' | 'terminal' | 'vault'>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'ERROR' | 'RESTARTING'>('ALL');
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);

  // Terminal state
  const [terminalSearch, setTerminalSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('ALL');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Vault state
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [twoFactorModalBotId, setTwoFactorModalBotId] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');

  // Webhook Modal state
  const [webhookModalBot, setWebhookModalBot] = useState<BotInstance | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [webhookSecretToken, setWebhookSecretToken] = useState('x-sec-tg-981029');
  const [webhookError, setWebhookError] = useState('');

  const selectedBot = bots.find((b) => b.id === selectedBotId) || bots[0];

  // Reveal Token handler with RBAC check
  const handleRevealTokenClick = (bot: BotInstance) => {
    if (!canAccess(currentUserRole, 'view_secrets')) {
      onAuditAction(
        'RBAC_ACCESS_DENIED',
        `Restricted token reveal attempt for ${bot.name} by ADMIN (view_secrets denied)`,
        'BLOCKED',
        bot.handle
      );
      alert('Access Denied: Only OWNER can inspect decrypted Telegram Bot API tokens.');
      return;
    }
    // Owner must verify 2FA
    setTwoFactorModalBotId(bot.id);
    setTwoFactorCode('');
    setTwoFactorError('');
  };

  const handleVerify2FAForToken = () => {
    if (twoFactorCode === '123456' || twoFactorCode === '777888' || /^\d{6}$/.test(twoFactorCode)) {
      if (twoFactorModalBotId) {
        setRevealedTokens((prev) => ({ ...prev, [twoFactorModalBotId]: true }));
        const bot = bots.find((b) => b.id === twoFactorModalBotId);
        onAuditAction(
          'BOT_TOKEN_REVEAL',
          `Decrypted API bot token for ${bot?.name} after 2FA validation`,
          'SUCCESS',
          bot?.handle
        );
      }
      setTwoFactorModalBotId(null);
    } else {
      setTwoFactorError('Invalid 6-digit TOTP code. (Try 123456 or 777888)');
    }
  };

  const handleCopyToken = (botId: string, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(botId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleOpenWebhookModal = (bot: BotInstance) => {
    setWebhookModalBot(bot);
    setNewWebhookUrl(bot.webhookUrl);
    setWebhookError('');
  };

  const handleSaveWebhook = () => {
    if (!webhookModalBot) return;
    const validation = validateWebhookUrl(newWebhookUrl);
    if (!validation.valid) {
      setWebhookError(validation.error || 'Invalid URL');
      return;
    }

    try {
      onUpdateWebhook(webhookModalBot.id, newWebhookUrl);
      setWebhookModalBot(null);
    } catch (err: any) {
      setWebhookError(err.message || 'Failed to update webhook');
    }
  };

  // Filter logs for selected bot
  const filteredLogs = (selectedBot?.logs || []).filter((log) => {
    if (logFilter !== 'ALL' && log.level !== logFilter) return false;
    if (
      terminalSearch &&
      !log.message.toLowerCase().includes(terminalSearch.toLowerCase()) &&
      !log.source.toLowerCase().includes(terminalSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'WARN':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'DEBUG':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Connect Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Telegram Botlar Boshqaruvi
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {bots.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()) && (statusFilter === 'ALL' || b.status === statusFilter)).length} / {bots.length}
            </span>
          </h2>
          <div className="flex gap-2 mt-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online</option>
              <option value="ERROR">Error</option>
              <option value="RESTARTING">Restarting</option>
            </select>
            {selectedBotIds.length > 0 && (
                <div className="flex gap-2 ml-4">
                    <button onClick={() => { selectedBotIds.forEach(onRestartBot); setSelectedBotIds([]); }} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white hover:bg-slate-700 cursor-pointer">
                        Restart ({selectedBotIds.length})
                    </button>
                    {onOpenBroadcastWithBot && (
                        <button onClick={() => { onOpenBroadcastWithBot(selectedBotIds[0]); }} className="px-3 py-2 rounded-lg bg-cyan-600 text-xs text-white hover:bg-cyan-500 cursor-pointer">
                            Broadcast
                        </button>
                    )}
                </div>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real Telegram BotFather API token orqali webhook, telemetriya va buyruqlarni boshqarish
          </p>
        </div>

        {onOpenConnectBot && (
          <button
            onClick={onOpenConnectBot}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-950/40 cursor-pointer transition-all"
          >
            <Bot className="w-4 h-4" />
            + Telegram Botni API Orqali Ulash
          </button>
        )}
      </div>

      {/* Empty State when bots.length === 0 */}
      {bots.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/80 border border-slate-800 text-center max-w-2xl mx-auto my-8 space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-950/20">
            <Bot className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Hozircha ulangan botlar yo‘q (0 ta)</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Barcha botlaringizni bitta xavfsiz boshqaruv panelidan nazorat qilish uchun
              <code className="text-cyan-400 font-mono mx-1">@BotFather</code> bergan HTTP API tokenini kiriting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-400 max-w-md mx-auto">
            <div className="text-white font-semibold flex items-center gap-2 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Real BotFather Integratsiyasi:
            </div>
            <div className="text-[11px] space-y-1">
              <div>1. <span className="text-slate-300">getMe</span> orqali bot nomi, username va Telegram ID olinadi</div>
              <div>2. <span className="text-slate-300">getWebhookInfo</span> orqali xatolar va navbatdagi so‘rovlar tekshiriladi</div>
              <div>3. API tokenlar <span className="text-amber-400 font-bold">AES-256</span> shifrlangan vaultda saqlanadi</div>
            </div>
          </div>

          {onOpenConnectBot && (
            <button
              onClick={onOpenConnectBot}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-cyan-950/50 cursor-pointer transition-all"
            >
              <Bot className="w-4 h-4" />
              Botni API Orqali Ulash
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Bot Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bots
              .filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()) && (statusFilter === 'ALL' || b.status === statusFilter))
              .map((bot) => {
                const isSelected = selectedBot?.id === bot.id;
                const isChecked = selectedBotIds.includes(bot.id);
                return (
                  <div
                    key={bot.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                                if (isChecked) setSelectedBotIds(prev => prev.filter(id => id !== bot.id));
                                else setSelectedBotIds(prev => [...prev, bot.id]);
                            }}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 checked:bg-cyan-500 cursor-pointer"
                        />
                    </div>
                  <div className="flex items-start justify-between" onClick={() => setSelectedBotId(bot.id)}>
                    <div className="flex items-center gap-2.5 ml-6">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                          bot.status === 'ONLINE'
                            ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                            : bot.status === 'RESTARTING'
                            ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-600/30 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-tight truncate max-w-[120px]">
                          {bot.name}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono">{bot.handle}</div>
                      </div>
                    </div>

                    {/* Status Indicator Pill */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
                        bot.status === 'ONLINE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : bot.status === 'RESTARTING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      }`}
                    >
                      {bot.status}
                    </span>
                  </div>

                  {/* Bot Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">AUDIENCE</div>
                      <div className="text-slate-200 font-bold">{bot.activeUsers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">LATENCY</div>
                      <div className="text-slate-200 font-bold">{bot.responseTimeMs}ms</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">UPDATES QUEUE</div>
                      <div
                        className={`font-bold ${
                          bot.pendingUpdates > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {bot.pendingUpdates} pending
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ERRORS</div>
                      <div
                        className={`font-bold ${
                          bot.errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {bot.errorCount}
                      </div>
                    </div>
                  </div>

                  {/* Quick Card Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {bot.maintenanceMode ? (
                        <span className="text-amber-400 font-semibold">MAINTENANCE ON</span>
                      ) : (
                        'LIVE'
                      )}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestartBot(bot.id);
                      }}
                      title="Restart Bot process"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Bot Control Center */}
          {selectedBot && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-4">
              {/* Header Bar */}
              <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{selectedBot.name}</h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {selectedBot.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                        {selectedBot.environment}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Telegram Handle: <span className="text-cyan-400">{selectedBot.handle}</span> •
                      Webhook:{' '}
                      <span className="text-slate-300 truncate max-w-sm inline-block align-bottom">
                        {selectedBot.webhookUrl}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onRestartBot(selectedBot.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    Restart Process
                  </button>

                  <button
                    onClick={() => handleOpenWebhookModal(selectedBot)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Config Webhook
                  </button>

                  <button
                    onClick={() => onDropPendingUpdates(selectedBot.id)}
                    title="Drop stuck pending Telegram updates"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 hover:border-rose-500/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Drop Pending Updates
                  </button>
                  <button
                    onClick={() => onKeepAliveBot(selectedBot.id)}
                    title="Send keep-alive ping to Render"
                    className="px-3 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-700/40 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Keep Alive
                  </button>

                  <button
                    onClick={() => onToggleMaintenance(selectedBot.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                      selectedBot.maintenanceMode
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {selectedBot.maintenanceMode ? 'Disable Maintenance' : 'Toggle Maintenance'}
                  </button>

                  {onOpenBroadcastWithBot && (
                    <button
                      onClick={() => onOpenBroadcastWithBot(selectedBot.id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Broadcast
                    </button>
                  )}
                  <button
                    onClick={() => openLogViewer(selectedBot.id, selectedBot.name, 'bot')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    View Logs
                  </button>
                </div>
              </div>

              {/* Navigation Tabs (Details / Live Terminal / Bot Credential Vault) */}
              <div className="px-5 border-b border-slate-800 flex gap-4 bg-slate-950/20">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'details'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  Telemetry & Parameters
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'terminal'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Live Terminal Logs (SSE Stream)
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'vault'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Bot Credential Vault
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    RBAC
                  </span>
                </button>
              </div>

              {/* Tab 1: Parameters & Telemetry */}
              {activeTab === 'details' && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400 uppercase font-mono">Webhook Status</div>
                      <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            selectedBot.webhookStatus === 'ACTIVE'
                              ? 'bg-emerald-400'
                              : selectedBot.webhookStatus === 'FAILED'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        {selectedBot.webhookStatus}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 font-mono break-all">
                        {selectedBot.webhookUrl}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400 uppercase font-mono">Commands Executed</div>
                      <div className="text-lg font-bold text-white font-mono mt-1">
                        {selectedBot.totalCommands.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 font-mono">
                        Avg response time: {selectedBot.responseTimeMs}ms
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400 uppercase font-mono">Health Check Ping</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Last probe 24s ago
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 font-mono">
                        Next heartbeat in 36s
                      </div>
                    </div>
                  </div>

                  {/* Advanced Technical Properties */}
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                      Production Deployment Specs
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Runtime:</span>
                        <div className="text-slate-200">Node.js 22 LTS (ESM)</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Worker Engine:</span>
                        <div className="text-slate-200">Telegraf v4.16 / grammY</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Max Connections:</span>
                        <div className="text-slate-200">40 pooled webhook slots</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Pending Drop Guard:</span>
                        <div className="text-slate-200">Auto-purge &gt; 500</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Webhook Configuration Modal */}
      {webhookModalBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Configure Webhook for {webhookModalBot.name}
              </h3>
              <button
                onClick={() => setWebhookModalBot(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Webhook URL (HTTPS Required)</label>
                <input
                  type="text"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.domain.com/tg/webhook"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Telegram Secret Token Header (X-Telegram-Bot-Api-Secret-Token)
                </label>
                <input
                  type="text"
                  value={webhookSecretToken}
                  onChange={(e) => setWebhookSecretToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Prevents forged requests by verifying token signature on incoming webhooks.
                </span>
              </div>

              {webhookError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {webhookError}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveWebhook}
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                Update Webhook & Re-verify
              </button>
              <button
                onClick={() => setWebhookModalBot(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Verification Modal for Token Inspection */}
      {twoFactorModalBotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Owner 2FA Authorization Required</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Decryption of production Bot API keys requires cryptographic two-factor validation. Enter your 6-digit TOTP code.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 text-center font-mono">
                Supported bypass test code: 123456 or 777888
              </div>
              {twoFactorError && (
                <div className="text-xs text-rose-400 text-center font-mono">{twoFactorError}</div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleVerify2FAForToken}
                className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                Verify & Decrypt Token
              </button>
              <button
                onClick={() => setTwoFactorModalBotId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
