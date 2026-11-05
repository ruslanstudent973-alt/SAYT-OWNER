import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccess, maskSecret, validateAction } from './rbac';
import { SlidingWindowRateLimiter, BruteForceGuard, verifyTwoFactorCode } from './security';
import { calculateSslHealth, validateWebhookUrl } from './healthcheck';

test('RBAC: OWNER has full access to all sensitive permissions', () => {
  assert.equal(canAccess('OWNER', 'manage_admins'), true);
  assert.equal(canAccess('OWNER', 'view_secrets'), true);
  assert.equal(canAccess('OWNER', 'manage_env'), true);
  assert.equal(canAccess('OWNER', 'trigger_backup'), true);
  assert.equal(validateAction('OWNER', 'manage_admins').allowed, true);
});

test('RBAC: ADMIN is restricted from secrets and admin management', () => {
  assert.equal(canAccess('ADMIN', 'manage_admins'), false);
  assert.equal(canAccess('ADMIN', 'view_secrets'), false);
  assert.equal(canAccess('ADMIN', 'manage_env'), false);
  assert.equal(canAccess('ADMIN', 'trigger_backup'), false);
  // ADMIN has operational permissions
  assert.equal(canAccess('ADMIN', 'view_dashboard'), true);
  assert.equal(canAccess('ADMIN', 'restart_bot'), true);
  assert.equal(canAccess('ADMIN', 'trigger_deploy'), true);

  const validation = validateAction('ADMIN', 'manage_admins');
  assert.equal(validation.allowed, false);
  assert.match(validation.reason || '', /requires OWNER/);
});

test('RBAC: maskSecret hides sensitive tokens from ADMIN but exposes to OWNER', () => {
  const token = '7492049102:AAHw59yG9vXk91p3-xyz901_qwe1';
  const maskedForAdmin = maskSecret(token, 'ADMIN');
  const revealedForOwner = maskSecret(token, 'OWNER');

  assert.equal(revealedForOwner, token);
  assert.notEqual(maskedForAdmin, token);
  assert.ok(maskedForAdmin.includes('••••'));
});

test('Security: SlidingWindowRateLimiter enforces request thresholds', () => {
  const limiter = new SlidingWindowRateLimiter(1000, 3);
  const now = 1000000;

  assert.equal(limiter.isAllowed('192.168.1.1', now).allowed, true);
  assert.equal(limiter.isAllowed('192.168.1.1', now + 10).allowed, true);
  assert.equal(limiter.isAllowed('192.168.1.1', now + 20).allowed, true);
  // 4th request in same window should be rejected
  const rejected = limiter.isAllowed('192.168.1.1', now + 30);
  assert.equal(rejected.allowed, false);
  assert.equal(rejected.remaining, 0);

  // Different IP should still be allowed
  assert.equal(limiter.isAllowed('192.168.1.2', now + 40).allowed, true);
});

test('Security: BruteForceGuard locks out account after repeated failures', () => {
  const guard = new BruteForceGuard(3, 5000);
  const user = 'admin@missioncontrol.internal';
  const now = 50000;

  assert.equal(guard.recordFailedAttempt(user, now).locked, false);
  assert.equal(guard.recordFailedAttempt(user, now).locked, false);
  const lockResult = guard.recordFailedAttempt(user, now);
  assert.equal(lockResult.locked, true);
  assert.equal(lockResult.attempts, 3);

  const checkLocked = guard.check(user, now + 100);
  assert.equal(checkLocked.locked, true);

  // Check after lockout expired
  const checkExpired = guard.check(user, now + 6000);
  assert.equal(checkExpired.locked, false);
});

test('Security: 2FA validator validates authentic verification codes', () => {
  assert.equal(verifyTwoFactorCode('123456'), true);
  assert.equal(verifyTwoFactorCode('777888'), true);
  assert.equal(verifyTwoFactorCode('000000'), false);
  assert.equal(verifyTwoFactorCode('abc'), false);
});

test('Healthcheck: calculateSslHealth categorizes certificate expiry thresholds', () => {
  assert.equal(calculateSslHealth(60).status, 'HEALTHY');
  assert.equal(calculateSslHealth(25).status, 'WARNING');
  assert.equal(calculateSslHealth(5).status, 'CRITICAL');
  assert.equal(calculateSslHealth(0).status, 'EXPIRED');
});

test('Healthcheck: validateWebhookUrl enforces valid HTTPS URLs', () => {
  assert.equal(validateWebhookUrl('https://api.myapp.com/telegram/webhook').valid, true);
  assert.equal(validateWebhookUrl('http://insecure.com/webhook').valid, false);
  assert.equal(validateWebhookUrl('not-a-url').valid, false);
});
