import { Permission, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'view_dashboard',
    'view_bots',
    'restart_bot',
    'edit_bot_config',
    'view_secrets',
    'manage_admins',
    'manage_env',
    'trigger_backup',
    'view_audit_logs',
    'broadcast_messages',
    'trigger_deploy',
    'manage_security',
  ],
  ADMIN: [
    'view_dashboard',
    'view_bots',
    'restart_bot',
    'view_audit_logs',
    'broadcast_messages',
    'trigger_deploy',
  ],
};

export function canAccess(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function validateAction(
  role: UserRole,
  permission: Permission
): { allowed: boolean; reason?: string } {
  if (canAccess(role, permission)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Access Denied: '${permission}' requires OWNER elevation. Current role is '${role}'.`,
  };
}

export function maskSecret(secret: string, role: UserRole): string {
  if (!secret) return '';
  if (role === 'OWNER') {
    return secret;
  }
  // Mask for Admin and unprivileged users
  if (secret.length <= 8) {
    return '••••••••';
  }
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-3);
  return `${prefix}••••••••••••••••${suffix}`;
}

export function getRoleBadgeStyle(role: UserRole): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (role === 'OWNER') {
    return {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'OWNER (Root)',
    };
  }
  return {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    label: 'ADMIN (Operator)',
  };
}
