import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Globe,
  ShieldCheck,
  FileText,
  KeyRound,
  Database,
  Code2,
  Radio,
  Lock,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { canAccess, getRoleBadgeStyle } from '../lib/rbac';

export type NavTab =
  | 'overview'
  | 'bots'
  | 'apps'
  | 'admins'
  | 'audit'
  | 'env'
  | 'backups'
  | 'architecture';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User;
  onSwitchUser: (idx: number) => void;
  onOpenBroadcast: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  onOpenBroadcast,
  onLogout,
}) => {
  const roleStyle = getRoleBadgeStyle(currentUser.role);
  const isOwner = currentUser.role === 'OWNER';

  const navItems: { id: NavTab; label: string; icon: React.ElementType; ownerOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bots', label: 'Telegram Bots', icon: Bot },
    { id: 'apps', label: 'Web Apps & Sites', icon: Globe },
    { id: 'admins', label: 'Admin Management', icon: ShieldCheck, ownerOnly: true },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
    { id: 'env', label: 'Env & Secrets', icon: KeyRound, ownerOnly: true },
    { id: 'backups', label: 'DB & MongoDB', icon: Database, ownerOnly: true },
    { id: 'architecture', label: 'Schemas & Specs', icon: Code2 },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/40">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
              BOTPULSE
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                PROD
              </span>
            </div>
            <div className="text-xs text-slate-400">Mission Control Hub</div>
          </div>
        </div>
      </div>

      {/* Operator Status Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-cyan-400 font-mono truncate">
              @{currentUser.telegramUsername || 'XRemperior'}
            </div>
            <div
              className={`inline-flex items-center text-[9px] px-1.5 py-0.2 rounded font-mono mt-1 border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
            >
              {roleStyle.label}
            </div>
          </div>
        </div>

        {/* Telegram ID & Logout Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">TG ID: {currentUser.telegramId || '8295677952'}</span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Chiqish (Logout)"
            >
              Chiqish
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Core Infrastructure
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const isLocked = item.ownerOnly && !isOwner;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/70 to-indigo-950/40 text-cyan-400 border border-cyan-800/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.ownerOnly && (
                <span
                  title={isLocked ? 'Restricted to Owner role' : 'Owner privilege'}
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isLocked
                      ? 'bg-slate-800/80 text-slate-400'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isLocked ? <Lock className="w-2.5 h-2.5" /> : 'ROOT'}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action CTA & Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenBroadcast}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 transition-all cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5" />
          Broadcast to Bots
        </button>

        <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
          Cluster Node: ap-east-1a • v3.4.0
        </div>
      </div>
    </aside>
  );
};
