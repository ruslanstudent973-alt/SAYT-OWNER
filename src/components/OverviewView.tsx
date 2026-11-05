import React, { useState, useMemo } from 'react';
import {
  Activity,
  Bot,
  Globe,
  AlertTriangle,
  Server,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HardDrive,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { AppInstance, BotInstance } from '../types';

interface OverviewViewProps {
  bots: BotInstance[];
  apps: AppInstance[];
  cpuUsage: number;
  ramUsage: number;
  onRestartBot: (id: string) => void;
  onRedeployApp: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

const TRAFFIC_CHART_DATA = [
  { time: '00:00', requests: 12400, errors: 42, latency: 28 },
  { time: '03:00', requests: 8900, errors: 18, latency: 24 },
  { time: '06:00', requests: 15300, errors: 29, latency: 26 },
  { time: '09:00', requests: 42100, errors: 180, latency: 38 },
  { time: '12:00', requests: 58900, errors: 410, latency: 45 },
  { time: '15:00', requests: 64200, errors: 320, latency: 42 },
  { time: '18:00', requests: 51200, errors: 210, latency: 36 },
  { time: '21:00', requests: 38700, errors: 95, latency: 31 },
];

const HISTORICAL_24H_DATA = [
  { time: '06:00', cpu: 22, ram: 52 },
  { time: '07:00', cpu: 25, ram: 53 },
  { time: '08:00', cpu: 34, ram: 56 },
  { time: '09:00', cpu: 48, ram: 61 },
  { time: '10:00', cpu: 62, ram: 68 },
  { time: '11:00', cpu: 74, ram: 75 },
  { time: '12:00', cpu: 82, ram: 79 }, // Peak near threshold
  { time: '13:00', cpu: 69, ram: 74 },
  { time: '14:00', cpu: 58, ram: 70 },
  { time: '15:00', cpu: 65, ram: 72 },
  { time: '16:00', cpu: 71, ram: 76 },
  { time: '17:00', cpu: 60, ram: 71 },
  { time: '18:00', cpu: 46, ram: 66 },
  { time: '19:00', cpu: 39, ram: 62 },
  { time: '20:00', cpu: 32, ram: 59 },
  { time: '21:00', cpu: 28, ram: 57 },
  { time: '22:00', cpu: 24, ram: 55 },
  { time: '23:00', cpu: 21, ram: 54 },
  { time: '00:00', cpu: 19, ram: 53 },
  { time: '01:00', cpu: 18, ram: 53 },
  { time: '02:00', cpu: 17, ram: 52 },
  { time: '03:00', cpu: 19, ram: 52 },
  { time: '04:00', cpu: 22, ram: 53 },
  { time: '05:00', cpu: 29, ram: 57 },
];

const HISTORICAL_6H_DATA = [
  { time: '00:00', cpu: 24, ram: 54 },
  { time: '00:30', cpu: 22, ram: 53 },
  { time: '01:00', cpu: 21, ram: 53 },
  { time: '01:30', cpu: 19, ram: 52 },
  { time: '02:00', cpu: 18, ram: 52 },
  { time: '02:30', cpu: 20, ram: 52 },
  { time: '03:00', cpu: 23, ram: 53 },
  { time: '03:30', cpu: 27, ram: 55 },
  { time: '04:00', cpu: 32, ram: 58 },
  { time: '04:30', cpu: 38, ram: 61 },
  { time: '05:00', cpu: 42, ram: 63 },
  { time: '05:30', cpu: 36, ram: 61 },
];

const HISTORICAL_1H_DATA = [
  { time: '05:00', cpu: 28, ram: 58 },
  { time: '05:05', cpu: 30, ram: 58 },
  { time: '05:10', cpu: 35, ram: 59 },
  { time: '05:15', cpu: 42, ram: 61 },
  { time: '05:20', cpu: 45, ram: 62 },
  { time: '05:25', cpu: 39, ram: 61 },
  { time: '05:30', cpu: 34, ram: 60 },
  { time: '05:35', cpu: 32, ram: 60 },
  { time: '05:40', cpu: 36, ram: 61 },
  { time: '05:45', cpu: 40, ram: 62 },
  { time: '05:50', cpu: 37, ram: 61 },
  { time: '05:55', cpu: 35, ram: 61 },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  bots,
  apps,
  cpuUsage,
  ramUsage,
  onRestartBot,
  onRedeployApp,
  onNavigateToTab,
}) => {
  const onlineBots = bots.filter((b) => b.status === 'ONLINE').length;
  const totalBotUsers = bots.reduce((sum, b) => sum + b.activeUsers, 0);
  const totalAppVisitors = apps.reduce((sum, a) => sum + a.analytics.dailyVisitors, 0);
  const totalReach = totalBotUsers + totalAppVisitors;
  const failingApps = apps.filter((a) => a.statusCode >= 500);
  const failingBots = bots.filter((b) => b.status === 'ERROR');

  const botDistributionData = bots.map((b) => ({
    name: b.name.split(' ')[0],
    users: Math.round(b.activeUsers / 1000),
    commands: Math.round(b.totalCommands / 1000),
  }));

  const [resourceTimeRange, setResourceTimeRange] = useState<'1h' | '6h' | '24h'>('24h');

  const resourceChartData = useMemo(() => {
    let base =
      resourceTimeRange === '1h'
        ? [...HISTORICAL_1H_DATA]
        : resourceTimeRange === '6h'
        ? [...HISTORICAL_6H_DATA]
        : [...HISTORICAL_24H_DATA];

    if (base.length > 0) {
      base[base.length - 1] = {
        ...base[base.length - 1],
        cpu: cpuUsage,
        ram: ramUsage,
      };
    }
    return base;
  }, [resourceTimeRange, cpuUsage, ramUsage]);

  const maxCpu = useMemo(
    () => (resourceChartData.length > 0 ? Math.max(...resourceChartData.map((d) => d.cpu)) : 0),
    [resourceChartData]
  );
  const maxRam = useMemo(
    () => (resourceChartData.length > 0 ? Math.max(...resourceChartData.map((d) => d.ram)) : 0),
    [resourceChartData]
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Real-time Alert Widget (if any failing services) */}
      {(failingApps.length > 0 || failingBots.length > 0) && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 shadow-lg shadow-rose-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                Active Critical Incident: Fleet Service Disruption
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-mono">
                  P1 CRITICAL
                </span>
              </div>
              <div className="text-xs text-rose-200/80 mt-1">
                {failingApps.map((a) => `${a.name} responding with HTTP ${a.statusCode}`).join(', ')}
                {failingBots.length > 0 &&
                  ` | ${failingBots.map((b) => `${b.handle} webhook failure`).join(', ')}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {failingApps.map((app) => (
              <button
                key={app.id}
                onClick={() => onRedeployApp(app.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Redeploy {app.name.split(' ')[0]}
              </button>
            ))}
            {failingBots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => onRestartBot(bot.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart {bot.handle}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Active Bots */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Bots</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {onlineBots}/{bots.length}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {bots.length > 0 ? Math.round((onlineBots / bots.length) * 100) : 0}% online
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${bots.length > 0 ? (onlineBots / bots.length) * 100 : 0}%` }}
            />
          </div>
        </div>


        {/* KPI 2: Total Cross-Platform Users */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Reach</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {totalReach.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <span>{totalBotUsers.toLocaleString()} bot users</span>
            <span>•</span>
            <span>{totalAppVisitors.toLocaleString()} web</span>
          </div>
        </div>

        {/* KPI 3: System Uptime */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">System Uptime</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">99.98%</span>
            <span className="text-[11px] text-emerald-400 font-mono">SLA Passed</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Last 30 days • 1 incident
          </div>
        </div>

        {/* KPI 4: Mean Latency */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Mean Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">32ms</span>
            <span className="text-[11px] text-amber-400 font-mono">p95: 48ms</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Direct Telegram Webhook TLS
          </div>
        </div>

        {/* KPI 5: Server Resources (CPU / RAM) */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Node Resources</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">CPU</span>
              <span className="text-white font-bold">{cpuUsage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  cpuUsage > 75 ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono pt-1">
              <span className="text-slate-400">RAM</span>
              <span className="text-white font-bold">{ramUsage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${ramUsage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CPU & RAM Historical Trends Recharts Card */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Node Compute & Memory (CPU & RAM) Historical Trends
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live Recharts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous utilization telemetry with 80% SLA threshold warning line & live sync
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Peak Metric Callouts */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Peak CPU: <strong>{maxCpu}%</strong>
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Peak RAM: <strong>{maxRam}%</strong>
              </span>
              <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-rose-500/20 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                SLA Alert: <strong>80%</strong>
              </span>
            </div>

            {/* Interactive Time Range Filters (1h, 6h, 24h) */}
            <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
              {(['1h', '6h', '24h'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setResourceTimeRange(range)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    resourceTimeRange === range
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={resourceChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} unit="%" stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const cpuVal = payload.find((p) => p.dataKey === 'cpu')?.value as number;
                    const ramVal = payload.find((p) => p.dataKey === 'ram')?.value as number;
                    const isHighLoad = (cpuVal || 0) >= 80 || (ramVal || 0) >= 80;

                    return (
                      <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs font-mono space-y-1.5 min-w-[170px]">
                        <div className="text-slate-400 border-b border-slate-800 pb-1 flex justify-between items-center">
                          <span>Time: {label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              isHighLoad
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {isHighLoad ? 'High Load' : 'Nominal'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-cyan-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            CPU:
                          </span>
                          <span className="font-bold">{cpuVal}%</span>
                        </div>
                        <div className="flex items-center justify-between text-indigo-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            RAM:
                          </span>
                          <span className="font-bold">{ramVal}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* 80% SLA Alert Threshold Line */}
              <ReferenceLine
                y={80}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{
                  value: '80% High Load Warning',
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="ram"
                name="RAM Allocation"
                stroke="#818cf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRam)"
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU Utilization"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCpu)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 24h Traffic & Error Rate */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">24-Hour Fleet Request Traffic & Latency</h3>
              <p className="text-xs text-slate-400">Aggregate Webhook invocations and response time</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Requests
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Latency (ms)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAFFIC_CHART_DATA}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bot Command Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Bot Activity Scale (k Users)</h3>
            <p className="text-xs text-slate-400">Active audience breakdown</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={botDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}k users`, 'Active Reach']}
                />
                <Bar dataKey="users" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Fleet Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telegram Bots Summary Card */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Telegram Fleet Overview</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('bots')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              Manage Fleet <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {bots.map((bot) => (
              <div key={bot.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    {bot.name}
                    <span className="text-[11px] text-slate-400 font-mono">{bot.handle}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                    <span>{bot.activeUsers.toLocaleString()} users</span>
                    <span>•</span>
                    <span>{bot.responseTimeMs}ms</span>
                    {bot.pendingUpdates > 0 && (
                      <span className="text-amber-400">
                        • {bot.pendingUpdates} pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${
                      bot.status === 'ONLINE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : bot.status === 'RESTARTING'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {bot.status}
                  </span>
                  <button
                    onClick={() => onRestartBot(bot.id)}
                    title="Restart Bot"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Web Apps & Sites Summary Card */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Web Services & SSL Health</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('apps')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              View All Services <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {apps.map((app) => (
              <div key={app.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    {app.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {app.provider}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                    <span>SSL: {app.ssl.daysRemaining}d left</span>
                    <span>•</span>
                    <span>{app.analytics.dailyVisitors.toLocaleString()} daily</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${
                      app.statusCode === 200
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                    }`}
                  >
                    HTTP {app.statusCode}
                  </span>
                  <button
                    onClick={() => onRedeployApp(app.id)}
                    title="1-Click Redeployment"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
