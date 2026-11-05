export type UserRole = 'OWNER' | 'ADMIN';

export type Permission =
  | 'view_dashboard'
  | 'view_bots'
  | 'restart_bot'
  | 'edit_bot_config'
  | 'view_secrets'
  | 'manage_admins'
  | 'manage_env'
  | 'trigger_backup'
  | 'view_audit_logs'
  | 'broadcast_messages'
  | 'trigger_deploy'
  | 'manage_security';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  telegramId: string;
  telegramUsername: string;
  accessCode: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin: string;
  lastIp: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export type BotStatus = 'ONLINE' | 'OFFLINE' | 'ERROR' | 'RESTARTING';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
}

export interface BotInstance {
  id: string;
  name: string;
  handle: string;
  category: 'FINANCE' | 'MONITORING' | 'AI_ASSISTANT' | 'COMMUNITY' | 'UTILITY';
  status: BotStatus;
  tokenEncrypted: string;
  tokenMasked: string;
  webhookUrl: string;
  webhookStatus: 'ACTIVE' | 'PENDING' | 'FAILED' | 'POLLING';
  activeUsers: number;
  totalCommands: number;
  errorCount: number;
  lastPing: string;
  responseTimeMs: number;
  pendingUpdates: number;
  environment: 'PRODUCTION' | 'STAGING';
  maintenanceMode: boolean;
  logs: LogEntry[];
  botId?: number;
  firstName?: string;
  isRealApi?: boolean;
  hostProvider?: 'RENDER' | 'HEROKU' | 'VPS' | 'OTHER';
  restartWebhookUrl?: string;
}

export type AppProvider = 'VERCEL' | 'RENDER' | 'CLOUDFLARE' | 'CUSTOM';
export type AppType = 'WEB_APP' | 'WEBSITE' | 'API';

export interface SslInfo {
  valid: boolean;
  daysRemaining: number;
  issuer: string;
  expiresAt: string;
  tlsVersion: string;
}

export interface AppAnalytics {
  dailyVisitors: number;
  activeSessions: number;
  errorRate: number;
  p95Ms: number;
}

export interface AppInstance {
  id: string;
  name: string;
  url: string;
  type: AppType;
  provider: AppProvider;
  statusCode: number;
  lastCheck: string;
  ssl: SslInfo;
  redeployWebhookUrl: string;
  lastDeployedAt: string;
  deploymentStatus: 'IDLE' | 'DEPLOYING' | 'SUCCESS' | 'FAILED';
  analytics: AppAnalytics;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  actionType:
    | 'AUTH_LOGIN'
    | 'AUTH_2FA_VERIFY'
    | 'BOT_RESTART'
    | 'BOT_WEBHOOK_CHANGE'
    | 'BOT_TOKEN_REVEAL'
    | 'BOT_BROADCAST'
    | 'APP_REDEPLOY'
    | 'ADMIN_INVITE'
    | 'ADMIN_ROLE_CHANGE'
    | 'ADMIN_REVOKE'
    | 'ENV_VAR_UPDATE'
    | 'DB_BACKUP'
    | 'SECURITY_RATE_LIMIT_BLOCK'
    | 'RBAC_ACCESS_DENIED';
  targetResource?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED';
}

export interface MetricLog {
  timestamp: string;
  cpuUsage: number;
  ramUsage: number;
  totalRequests: number;
  activeConnections: number;
  errorRate: number;
  avgLatencyMs: number;
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface BroadcastDraft {
  botIds: string[];
  audience: 'ALL' | 'ACTIVE_24H' | 'PREMIUM';
  message: string;
  parseMode: 'HTML' | 'MARKDOWN' | 'PLAIN';
  includeButton: boolean;
  buttonText?: string;
  buttonUrl?: string;
}
