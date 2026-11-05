import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  ShieldCheck,
  Activity,
  RefreshCw,
  Search,
  Key,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getRoleBadgeStyle } from '../lib/rbac';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  currentUser: User;
  onSwitchUser: (idx: number) => void;
  onToggle2FA: () => void;
  onOpenBroadcast: () => void;
  errorSpikeCount: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onSwitchUser,
  onToggle2FA,
  onOpenBroadcast,
  errorSpikeCount,
  onLogout,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const roleStyle = getRoleBadgeStyle(currentUser.role);

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Infrastructure Overview',
      subtitle: 'Real-time telemetry, platform KPIs, and fleet health',
    },
    bots: {
      title: 'Telegram Bots Management',
      subtitle: 'Status monitoring, webhook controls, live logs & credential vault',
    },
    apps: {
      title: 'Websites & Web Applications',
      subtitle: 'HTTP health checks, SSL certificate tracker & 1-click CI/CD triggers',
    },
    admins: {
      title: 'Role-Based Access Control (RBAC)',
      subtitle: 'Operator directory, privileges matrix, and security firewall rules',
    },
    audit: {
      title: 'Security Audit Trail',
      subtitle: 'Immutable activity log of all bot restarts, token reveals, and config mutations',
    },
    env: {
      title: 'Environment Secrets Vault',
      subtitle: 'AES-256 encrypted variables, API keys, and deployment credentials',
    },
    backups: {
      title: 'Database Backups & Health',
      subtitle: 'Disaster recovery snapshots, automated schedules, and storage vacuuming',
    },
    architecture: {
      title: 'Architecture & Production Specs',
      subtitle: 'PostgreSQL Prisma, MongoDB schemas, RBAC middleware, and health workers',
    },
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <>
      <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Title & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              {tabTitles[currentTab]?.title || 'Dashboard'}
              {errorSpikeCount > 0 && currentTab === 'overview' && (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  {errorSpikeCount} Issue Detected
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {tabTitles[currentTab]?.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions, 2FA, Role Selector */}
        {/* Right: Actions, MongoDB Status, 2FA, User Identity */}
        <div className="flex items-center gap-3">
          {/* MongoDB Cluster Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB: Cluster0</span>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            title="Poll endpoints and update telemetry"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* 2FA Status Button */}
          <button
            onClick={() => setShow2FAModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              currentUser.twoFactorEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            {currentUser.twoFactorEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2FA Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Enable 2FA</span>
              </>
            )}
          </button>

          {/* Operator Identifier */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 hidden sm:inline">User:</span>
            <span className={`font-semibold ${roleStyle.text}`}>
              {currentUser.name.split(' ')[0]} (@{currentUser.telegramUsername || 'XRemperior'})
            </span>
          </div>
        </div>
      </header>

      {/* 2FA Security Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-400">TOTP Authenticator Protection</p>
                </div>
              </div>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Status for {currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {currentUser.twoFactorEnabled ? 'Enforced on logins & secret reveals' : 'Unprotected account'}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    currentUser.twoFactorEnabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {currentUser.twoFactorEnabled ? 'ENFORCED' : 'DISABLED'}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300">Security Requirement:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Both <code className="text-amber-400">OWNER</code> and <code className="text-cyan-400">ADMIN</code> accounts must present an RFC-6238 TOTP token upon session initialization and when accessing the encrypted credentials vault.
                </p>
                <div className="text-[11px] text-slate-400">
                  Demo bypass codes supported: <code className="text-cyan-400 font-mono">123456</code> or <code className="text-cyan-400 font-mono">777888</code>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onToggle2FA();
                  setShow2FAModal(false);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  currentUser.twoFactorEnabled
                    ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40'
                }`}
              >
                {currentUser.twoFactorEnabled ? 'Deactivate 2FA for this user' : 'Activate 2FA Enforcment'}
              </button>
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
