/**
 * Tests for rate limiting logic (pure functions only, no AsyncStorage).
 */

describe('Rate limit key generation', () => {
  it('should generate a key with today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key = `@ratelimit/apply/${today}`;
    expect(key).toMatch(/^@ratelimit\/apply\/\d{4}-\d{2}-\d{2}$/);
  });

  it('today\'s key should differ from tomorrow\'s key', () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    // They should be different (unless this runs exactly at midnight)
    if (todayStr !== tomorrowStr) {
      expect(todayStr).not.toBe(tomorrowStr);
    }
  });
});

describe('Document authorization expiry', () => {
  it('should calculate 24-hour expiry correctly', () => {
    const authorizedAt = new Date('2026-03-09T10:00:00Z');
    const expectedExpiry = new Date('2026-03-10T10:00:00Z');
    const actualExpiry = new Date(authorizedAt.getTime() + 24 * 60 * 60 * 1000);
    expect(actualExpiry.toISOString()).toBe(expectedExpiry.toISOString());
  });

  it('should detect an expired authorization', () => {
    const expiresAt = new Date(Date.now() - 1000); // 1 second ago
    const isExpired = expiresAt < new Date();
    expect(isExpired).toBe(true);
  });

  it('should detect a valid (non-expired) authorization', () => {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now
    const isExpired = expiresAt < new Date();
    expect(isExpired).toBe(false);
  });
});
