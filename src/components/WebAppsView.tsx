import React, { useState } from 'react';
import {
  Globe,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Search,
} from 'lucide-react';
import { AppInstance, AppProvider, AppType } from '../types';
import { calculateSslHealth } from '../lib/healthcheck';

interface WebAppsViewProps {
  apps: AppInstance[];
  onRedeployApp: (id: string) => void;
  onPingApp: (id: string) => void;
  onAddApp: (app: AppInstance) => void;
  onOpenConnectApp?: () => void;
  openLogViewer: (id: string, name: string, type: 'bot' | 'app') => void;
}

export const WebAppsView: React.FC<WebAppsViewProps> = ({
  apps,
  onRedeployApp,
  onPingApp,
  onAddApp,
  onOpenConnectApp,
  openLogViewer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppType, setNewAppType] = useState<AppType>('WEB_APP');
  const [newAppProvider, setNewAppProvider] = useState<AppProvider>('VERCEL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'ERROR'>('ALL');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newAppUrl) return;

    const newApp: AppInstance = {
      id: 'app_' + Math.random().toString(36).substring(2, 9),
      name: newAppName,
      url: newAppUrl.startsWith('http') ? newAppUrl : `https://${newAppUrl}`,
      type: newAppType,
      provider: newAppProvider,
      statusCode: 200,
      lastCheck: new Date().toISOString(),
      ssl: {
        valid: true,
        daysRemaining: 89,
        issuer: "Let's Encrypt Authority X3",
        expiresAt: new Date(Date.now() + 89 * 86400000).toISOString(),
        tlsVersion: 'TLS 1.3',
      },
      redeployWebhookUrl: `https://api.${newAppProvider.toLowerCase()}.com/deploy/hook_${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      lastDeployedAt: new Date().toISOString(),
      deploymentStatus: 'IDLE',
      analytics: {
        dailyVisitors: 0,
        activeSessions: 0,
        errorRate: 0.0,
        p95Ms: 45,
      },
    };

    onAddApp(newApp);
    setShowAddModal(false);
    setNewAppName('');
    setNewAppUrl('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            Web Infrastructure & Edge Applications
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {apps.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) && (statusFilter === 'ALL' || (statusFilter === 'HEALTHY' ? a.statusCode === 200 : a.statusCode >= 500))).length} / {apps.length}
            </span>
          </h2>
          <div className="flex gap-2 mt-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="HEALTHY">Healthy (200)</option>
              <option value="ERROR">Error (500+)</option>
            </select>
            {selectedAppIds.length > 0 && (
                <button onClick={() => { selectedAppIds.forEach(onRedeployApp); setSelectedAppIds([]); }} className="px-3 py-2 ml-4 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white hover:bg-slate-700 cursor-pointer">
                    Redeploy ({selectedAppIds.length})
                </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            HTTP status code polling, automated TLS/SSL certificate monitoring, and 1-click CI/CD triggers
          </p>
        </div>

        <button
          onClick={onOpenConnectApp || (() => setShowAddModal(true))}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Monitored Site
        </button>
      </div>

      {/* Web Apps Grid or Empty State */}
      {apps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/80 border border-slate-800 text-center max-w-2xl mx-auto my-8 space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-950/20">
            <Globe className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Hozircha ulangan saytlar yo‘q (0 ta)</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Veb-saytlaringiz, API endpointlar va web ilovalaringizni monitoring qilish uchun yangi sayt qo‘shing.
            </p>
          </div>

          <button
            onClick={onOpenConnectApp || (() => setShowAddModal(true))}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-indigo-950/50 cursor-pointer transition-all"
          >
            <Globe className="w-4 h-4" />
            Saytni URL orqali Ulash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps
            .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) && (statusFilter === 'ALL' || (statusFilter === 'HEALTHY' ? a.statusCode === 200 : a.statusCode >= 500)))
            .map((app) => {
            const sslHealth = calculateSslHealth(app.ssl.daysRemaining);
            const isHealthy = app.statusCode === 200;
            const isDeploying = app.deploymentStatus === 'DEPLOYING';

            return (
              <div
                key={app.id}
                className={`p-5 rounded-xl border bg-slate-900/90 space-y-4 transition-all shadow-md ${
                  !isHealthy
                    ? 'border-rose-500/50 shadow-rose-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isHealthy
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                      }`}
                    >
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">{app.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {app.provider}
                        </span>
                      </div>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 mt-0.5"
                      >
                        {app.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* HTTP Status Code Pill */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold border flex items-center gap-1.5 ${
                        isHealthy
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      }`}
                    >
                      {isHealthy ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      HTTP {app.statusCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Checked {new Date(app.lastCheck).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* SSL Certificate Tracker Widget */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      SSL / TLS Certificate Status
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${sslHealth.badgeClass}`}
                    >
                      {sslHealth.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-400">
                    <div>
                      <span>Issuer: </span>
                      <strong className="text-slate-200">{app.ssl.issuer}</strong>
                    </div>
                    <div>
                      <span>Protocol: </span>
                      <strong className="text-slate-200">{app.ssl.tlsVersion}</strong>
                    </div>
                  </div>
                </div>

                {/* Analytics Metrics Strip */}
                <div className="grid grid-cols-4 gap-2 text-xs font-mono p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <div>
                    <div className="text-[10px] text-slate-500">VISITORS</div>
                    <div className="text-slate-200 font-bold">
                      {app.analytics.dailyVisitors.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">SESSIONS</div>
                    <div className="text-slate-200 font-bold">{app.analytics.activeSessions}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">ERROR RATE</div>
                    <div
                      className={`font-bold ${
                        app.analytics.errorRate > 1 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {app.analytics.errorRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">p95 LATENCY</div>
                    <div className="text-slate-200 font-bold">{app.analytics.p95Ms}ms</div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => onPingApp(app.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    Health Probe Ping
                  </button>

                  <button
                    disabled={isDeploying}
                    onClick={() => onRedeployApp(app.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDeploying
                        ? 'bg-indigo-600/50 text-indigo-200 animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
                    {isDeploying ? 'Deploying to Edge...' : '1-Click Redeploy'}
                  </button>
                  <button
                    onClick={() => openLogViewer(app.id, app.name, 'app')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Logs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Website / App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Add Monitored Web Service
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Documentation Portal"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Endpoint URL (HTTPS)</label>
                <input
                  type="text"
                  required
                  placeholder="https://docs.missioncontrol.io"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Service Type</label>
                  <select
                    value={newAppType}
                    onChange={(e) => setNewAppType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="WEB_APP">Web Application</option>
                    <option value="WEBSITE">Static Website</option>
                    <option value="API">REST / GraphQL API</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Host Provider</label>
                  <select
                    value={newAppProvider}
                    onChange={(e) => setNewAppProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="VERCEL">Vercel</option>
                    <option value="RENDER">Render</option>
                    <option value="CLOUDFLARE">Cloudflare Pages</option>
                    <option value="CUSTOM">Custom VPS / Node</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md cursor-pointer"
              >
                Register & Initialize Health Check
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
