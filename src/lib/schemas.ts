export const PRISMA_SCHEMA = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  OWNER
  ADMIN
}

enum BotStatus {
  ONLINE
  OFFLINE
  ERROR
  RESTARTING
}

enum AppType {
  WEB_APP
  WEBSITE
  API
}

enum AppProvider {
  VERCEL
  RENDER
  CLOUDFLARE
  CUSTOM
}

enum AuditStatus {
  SUCCESS
  BLOCKED
  FAILED
}

model User {
  id               String     @id @default(uuid())
  name             String
  email            String     @unique
  passwordHash     String
  role             Role       @default(ADMIN)
  avatarUrl        String?
  twoFactorEnabled Boolean    @default(false)
  twoFactorSecret  String?    // Encrypted AES-256-GCM
  lastLoginAt      DateTime?
  lastIp           String?
  status           String     @default("ACTIVE")
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  auditLogs        AuditLog[]

  @@index([email])
}

model BotInstance {
  id              String      @id @default(uuid())
  name            String
  handle          String      @unique
  category        String      @default("UTILITY")
  status          BotStatus   @default(ONLINE)
  tokenEncrypted  String      // AES-256-GCM encrypted Telegram token
  tokenMasked     String
  webhookUrl      String
  webhookSecret   String?     // X-Telegram-Bot-Api-Secret-Token
  activeUsers     Int         @default(0)
  totalCommands   Int         @default(0)
  errorCount      Int         @default(0)
  responseTimeMs  Int         @default(45)
  pendingUpdates  Int         @default(0)
  environment     String      @default("PRODUCTION")
  maintenanceMode Boolean     @default(false)
  lastPingAt      DateTime    @default(now())
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  logs            BotLog[]

  @@index([status])
  @@index([handle])
}

model BotLog {
  id          String      @id @default(uuid())
  botId       String
  bot         BotInstance @relation(fields: [botId], references: [id], onDelete: Cascade)
  level       String      // INFO, WARN, ERROR, DEBUG
  message     String
  source      String      // webhook, polling, worker
  timestamp   DateTime    @default(now())

  @@index([botId, timestamp])
}

model AppInstance {
  id                 String      @id @default(uuid())
  name               String
  url                String      @unique
  type               AppType     @default(WEB_APP)
  provider           AppProvider @default(VERCEL)
  statusCode         Int         @default(200)
  sslValid           Boolean     @default(true)
  sslDaysRemaining   Int         @default(90)
  sslIssuer          String      @default("Let's Encrypt Authority X3")
  sslExpiresAt       DateTime
  redeployWebhookUrl String
  lastDeployedAt     DateTime?
  dailyVisitors      Int         @default(0)
  activeSessions     Int         @default(0)
  errorRate          Float       @default(0.0)
  p95LatencyMs       Int         @default(80)
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
}

model AuditLog {
  id             String      @id @default(uuid())
  userId         String?
  user           User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  userName       String
  userEmail      String
  userRole       Role
  actionType     String
  targetResource String?
  details        String
  ipAddress      String
  status         AuditStatus @default(SUCCESS)
  timestamp      DateTime    @default(now())

  @@index([timestamp])
  @@index([actionType])
  @@index([userId])
}

model MetricLog {
  id                String   @id @default(uuid())
  cpuUsage          Float
  ramUsage          Float
  totalRequests     Int
  activeConnections Int
  errorRate         Float
  avgLatencyMs      Float
  timestamp         DateTime @default(now())

  @@index([timestamp])
}

model EnvVariable {
  id             String   @id @default(uuid())
  key            String   @unique
  valueEncrypted String   // Encrypted AES-256-GCM
  isSecret       Boolean  @default(true)
  description    String?
  updatedBy      String
  updatedAt      DateTime @updatedAt
}`;

export const MONGOOSE_SCHEMA = `// models/schemas.ts (MongoDB / Mongoose)
import mongoose, { Schema, Document } from 'mongoose';

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['OWNER', 'ADMIN'], default: 'ADMIN' },
  avatarUrl: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }, // Encrypted AES-256
  lastLoginAt: { type: Date },
  lastIp: { type: String },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

// Bot Instance Schema
const BotInstanceSchema = new Schema({
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: 'UTILITY' },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR', 'RESTARTING'], default: 'ONLINE', index: true },
  tokenEncrypted: { type: String, required: true },
  tokenMasked: { type: String, required: true },
  webhookUrl: { type: String, required: true },
  webhookSecret: { type: String },
  activeUsers: { type: Number, default: 0 },
  totalCommands: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  responseTimeMs: { type: Number, default: 45 },
  pendingUpdates: { type: Number, default: 0 },
  environment: { type: String, enum: ['PRODUCTION', 'STAGING'], default: 'PRODUCTION' },
  maintenanceMode: { type: Boolean, default: false },
  lastPingAt: { type: Date, default: Date.now },
  logs: [{
    level: { type: String, enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'] },
    message: String,
    source: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// App Instance Schema
const AppInstanceSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  type: { type: String, enum: ['WEB_APP', 'WEBSITE', 'API'], default: 'WEB_APP' },
  provider: { type: String, enum: ['VERCEL', 'RENDER', 'CLOUDFLARE', 'CUSTOM'], default: 'VERCEL' },
  statusCode: { type: Number, default: 200 },
  ssl: {
    valid: { type: Boolean, default: true },
    daysRemaining: { type: Number, default: 90 },
    issuer: { type: String },
    expiresAt: { type: Date },
    tlsVersion: { type: String, default: 'TLS 1.3' }
  },
  redeployWebhookUrl: { type: String },
  lastDeployedAt: { type: Date },
  analytics: {
    dailyVisitors: { type: Number, default: 0 },
    activeSessions: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0.0 },
    p95Ms: { type: Number, default: 80 }
  }
}, { timestamps: true });

// Audit Log Schema
const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, enum: ['OWNER', 'ADMIN'], required: true },
  actionType: { type: String, required: true, index: true },
  targetResource: { type: String },
  details: { type: String, required: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'BLOCKED', 'FAILED'], default: 'SUCCESS' },
  timestamp: { type: Date, default: Date.now, index: true }
});

export const User = mongoose.model('User', UserSchema);
export const BotInstance = mongoose.model('BotInstance', BotInstanceSchema);
export const AppInstance = mongoose.model('AppInstance', AppInstanceSchema);
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);`;

export const RBAC_MIDDLEWARE_CODE = `// middleware/rbac.ts - Production Next.js / Express RBAC Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { canAccess, Permission } from '../lib/rbac';
import { createAuditLog } from '../lib/security';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  twoFactorVerified: boolean;
}

export function requireRole(requiredPermission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser;
      
      // Check permission
      if (!canAccess(decoded.role, requiredPermission)) {
        // Record audit violation
        await recordAuditViolation({
          userId: decoded.id,
          userName: decoded.name,
          userEmail: decoded.email,
          userRole: decoded.role,
          permission: requiredPermission,
          ip: req.ip || req.socket.remoteAddress || 'unknown'
        });

        return res.status(403).json({
          error: 'Forbidden: Insufficient privileges',
          requiredPermission,
          role: decoded.role,
          message: 'This operation requires OWNER authorization'
        });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  };
}`;

export const BOT_HEALTH_CHECK_CODE = `// services/botHealthCheck.ts - High-Throughput Telegram Bot Health Check Worker
import axios from 'axios';

export interface TelegramWebhookInfo {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
  };
}

export class BotHealthCheckService {
  private static readonly TIMEOUT_MS = 5000;

  /**
   * Pings Telegram Bot API to verify token validity, webhook status, and update latency
   */
  static async checkBotHealth(botToken: string): Promise<{
    status: 'ONLINE' | 'OFFLINE' | 'ERROR';
    latencyMs: number;
    webhookUrl: string;
    pendingUpdates: number;
    lastError?: string;
  }> {
    const startTime = performance.now();
    try {
      const url = \`https://api.telegram.org/bot\${botToken}/getWebhookInfo\`;
      const response = await axios.get<TelegramWebhookInfo>(url, {
        timeout: this.TIMEOUT_MS,
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.data.ok) {
        return {
          status: 'ERROR',
          latencyMs,
          webhookUrl: '',
          pendingUpdates: 0,
          lastError: 'Telegram API returned ok: false',
        };
      }

      const info = response.data.result;
      const hasRecentError = !!info.last_error_message;
      const isOffline = !info.url && info.pending_update_count === 0;

      return {
        status: hasRecentError ? 'ERROR' : isOffline ? 'OFFLINE' : 'ONLINE',
        latencyMs,
        webhookUrl: info.url,
        pendingUpdates: info.pending_update_count,
        lastError: info.last_error_message,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        status: 'ERROR',
        latencyMs,
        webhookUrl: '',
        pendingUpdates: 0,
        lastError: err.message || 'Connection timeout or invalid token',
      };
    }
  }

  /**
   * Sets or updates webhook with secret token header for webhook authenticity
   */
  static async setWebhook(botToken: string, webhookUrl: string, secretToken: string) {
    const endpoint = \`https://api.telegram.org/bot\${botToken}/setWebhook\`;
    const response = await axios.post(endpoint, {
      url: webhookUrl,
      drop_pending_updates: false,
      max_connections: 40,
      secret_token: secretToken,
    });
    return response.data;
  }

  /**
   * Drops stuck / overflowing pending updates during an emergency restart
   */
  static async dropPendingUpdates(botToken: string) {
    const endpoint = \`https://api.telegram.org/bot\${botToken}/deleteWebhook\`;
    return (await axios.post(endpoint, { drop_pending_updates: true })).data;
  }
}`;
