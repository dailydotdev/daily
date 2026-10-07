/**
 * Anonymous impression analytics, same contract as statusline/statusline.mjs:
 * a tracking id minted by /boot (what a logged-out daily.dev visitor gets),
 * impressions queued in memory and flushed to /e in batches. Never code,
 * paths or session content: only the shown post id, its title and where it
 * was shown. Off with DAILY_DEV_TELEMETRY=0 or the plugin's `telemetry`
 * option. Failures are swallowed: analytics never break the mod.
 */
import { ORIGIN, type Io, type Post } from './feed';

export const VERSION = '0.7.0';
const DEDUP_MS = 30 * 60 * 1000; // log each post at most every 30 min per placement

type Identity = { userId: string; deviceId: string };

export class Telemetry {
  enabled = false;
  identity: Identity | undefined;
  private queue: Record<string, unknown>[] = [];
  private logged = new Map<string, number>();
  private visitId = crypto.randomUUID();
  private sessionId = crypto.randomUUID();

  async init(io: Io, optionOn: boolean): Promise<void> {
    const env = (await io.telemetryEnv()) ?? '';
    this.enabled = optionOn && !['0', 'false'].includes(env);
    if (!this.enabled) return;
    const stored = (await io.get('identity')) as Identity | undefined;
    if (stored?.userId) {
      this.identity = stored;
      return;
    }
    let userId: string | undefined;
    try {
      const res = await io.fetch(`${ORIGIN}/boot?v=claude-code-mod-${VERSION}`, {
        headers: { app: 'claude-code' },
      });
      userId = (JSON.parse(res.text) as { user?: { id?: string } }).user?.id;
    } catch {
      // offline: fall back to a local id
    }
    this.identity = { userId: userId ?? crypto.randomUUID(), deviceId: crypto.randomUUID() };
    await io.set('identity', this.identity);
  }

  impression(post: Post, placement: string, now: number): void {
    if (!this.enabled || !this.identity) return;
    const key = `${placement}:${post.id}`;
    if (now - (this.logged.get(key) ?? 0) < DEDUP_MS) return;
    this.logged.set(key, now);
    this.queue.push({
      event_id: `${Math.floor(now / 1000)}${Math.random().toString(36).slice(2, 8)}`,
      event_name: 'impression',
      event_timestamp: new Date(now).toISOString(),
      visit_id: this.visitId,
      session_id: this.sessionId,
      user_id: this.identity.userId,
      device_id: this.identity.deviceId,
      app_platform: 'claude-code',
      app_version: VERSION,
      target_type: 'post',
      target_id: post.id,
      feed_item_title: post.title,
      extra: JSON.stringify({ origin: `claude code mod ${placement}` }),
    });
  }

  async flush(io: Io): Promise<void> {
    if (!this.queue.length) return;
    const events = this.queue.splice(0, 200);
    try {
      const res = await io.fetch(`${ORIGIN}/e`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      this.queue.unshift(...events.slice(-100)); // retry next flush, bounded
    }
  }
}
