import React, { useState } from 'react';
import { useMissionStore } from './lib/store';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { TelegramBotsView } from './components/TelegramBotsView';
import { WebAppsView } from './components/WebAppsView';
import { RbacAdminView } from './components/RbacAdminView';
import { AuditLogView } from './components/AuditLogView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { BroadcastModal } from './components/BroadcastModal';
import { LoginGateModal } from './components/LoginGateModal';
import { ConnectBotModal } from './components/ConnectBotModal';
import { ConnectWebsiteModal } from './components/ConnectWebsiteModal';
import { LogViewer } from './components/LogViewer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isConnectBotOpen, setIsConnectBotOpen] = useState(false);
  const [isConnectAppOpen, setIsConnectAppOpen] = useState(false);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [logTarget, setLogTarget] = useState<{ id: string; name: string; type: 'bot' | 'app' } | null>(null);

  const openLogViewer = (id: string, name: string, type: 'bot' | 'app') => {
    setLogTarget({ id, name, type });
    setIsLogViewerOpen(true);
  };

  const {
    currentUser,
    isAuthenticated,
    login,
    switchUser,
    users,
    bots,
    apps,
    envVars,
    auditLogs,
    cpuUsage,
    ramUsage,
    blockedIps,
    unblockIp,
    connectRealBot,
    connectRealApp,
    restartBot,
    updateBotWebhook,
    dropPendingUpdates,
    toggleMaintenance,
    redeployApp,
    pingApp,
    inviteAdminWithTelegram,
    revokeAdmin,
    toggle2FA,
    addEnvVariable,
    deleteEnvVariable,
    broadcastMessage,
    triggerDatabaseBackup,
    addAudit,
    keepAliveBot,
  } = useMissionStore();

  const handleOpenBroadcast = () => {
    setIsBroadcastOpen(true);
  };

  const handleOpenConnectBot = () => setIsConnectBotOpen(true);
  const handleOpenConnectApp = () => setIsConnectAppOpen(true);

  const failingCount =
    apps.filter((a) => a.statusCode >= 500).length +
    bots.filter((b) => b.status === 'ERROR').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {!isAuthenticated ? (
        <LoginGateModal onLogin={login} />
      ) : (
        <>
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            currentUser={currentUser}
            onSwitchUser={switchUser}
            onOpenBroadcast={() => handleOpenBroadcast()}
          />

          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950">
            <Header
              currentTab={currentTab}
              currentUser={currentUser}
              onSwitchUser={switchUser}
              onToggle2FA={toggle2FA}
              onOpenBroadcast={() => handleOpenBroadcast()}
              errorSpikeCount={failingCount}
            />

            <main className="flex-1 overflow-y-auto">
              {currentTab === 'overview' && (
                <OverviewView
                  bots={bots}
                  apps={apps}
                  cpuUsage={cpuUsage}
                  ramUsage={ramUsage}
                  onRestartBot={restartBot}
                  onRedeployApp={redeployApp}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'bots' && (
                <TelegramBotsView
                  bots={bots}
                  currentUserRole={currentUser.role}
                  onRestartBot={restartBot}
                  onUpdateWebhook={updateBotWebhook}
                  onDropPendingUpdates={dropPendingUpdates}
                  onKeepAliveBot={keepAliveBot}
                  onToggleMaintenance={toggleMaintenance}
                  onOpenBroadcastWithBot={(botId) => handleOpenBroadcast(botId)}
                  onOpenConnectBot={handleOpenConnectBot}
                  onAuditAction={addAudit}
                  openLogViewer={openLogViewer}
                />
              )}

              {currentTab === 'apps' && (
                <WebAppsView
                  apps={apps}
                  onRedeployApp={redeployApp}
                  onPingApp={pingApp}
                  onAddApp={() => {}}
                  onOpenConnectApp={handleOpenConnectApp}
                  openLogViewer={openLogViewer}
                />
              )}

              {currentTab === 'admins' && (
                <RbacAdminView
                  currentUser={currentUser}
                  users={users}
                  blockedIps={blockedIps}
                  onInviteAdmin={inviteAdminWithTelegram}
                  onRevokeAdmin={revokeAdmin}
                  onUnblockIp={unblockIp}
                  onSwitchUser={switchUser}
                />
              )}

              {currentTab === 'audit' && <AuditLogView auditLogs={auditLogs} />}

              {currentTab === 'env' && (
                <SystemSettingsView
                  currentUser={currentUser}
                  envVars={envVars}
                  activeSubTab="env"
                  onAddEnvVar={addEnvVariable}
                  onDeleteEnvVar={deleteEnvVariable}
                  onTriggerBackup={triggerDatabaseBackup}
                  onSwitchUser={switchUser}
                  onAuditAction={addAudit}
                />
              )}
            </main>
          </div>
        </>
      )}

      {isBroadcastOpen && (
        <BroadcastModal
          bots={bots}
          onClose={() => setIsBroadcastOpen(false)}
          onSendBroadcast={broadcastMessage}
        />
      )}
      {isConnectBotOpen && (
        <ConnectBotModal 
          onClose={() => setIsConnectBotOpen(false)} 
          onConnectBot={(token, category, hostProvider) => connectRealBot(token, category, hostProvider)} 
        />
      )}
      {isConnectAppOpen && (
        <ConnectWebsiteModal onClose={() => setIsConnectAppOpen(false)} onConnectApp={connectRealApp} />
      )}
      {isLogViewerOpen && logTarget && (
        <LogViewer
          targetId={logTarget.id}
          targetName={logTarget.name}
          type={logTarget.type}
          onClose={() => setIsLogViewerOpen(false)}
        />
      )}
    </div>
  );
}
