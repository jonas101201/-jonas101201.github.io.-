export const requestNeuronReserve = 200;
const leaseMs = 5 * 60_000;

export class RecallBudget {
  constructor(ctx) {
    this.storage = ctx.storage;
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY, user TEXT NOT NULL, day INTEGER NOT NULL,
      leaseUntil INTEGER NOT NULL
    )`);
    this.sql.exec('CREATE INDEX IF NOT EXISTS attempts_day_user ON attempts (day, user)');
  }

  async fetch(request) {
    if (request.method !== 'POST') return new Response(null, { status: 405 });
    const { id, user, daily, perUser } = await request.json();
    if (!/^[a-f0-9]{64}$/.test(id)) return new Response(null, { status: 400 });
    const { pathname } = new URL(request.url);
    if (pathname === '/release') {
      this.sql.exec('UPDATE attempts SET leaseUntil = 0 WHERE id = ?', id);
      return new Response(null, { status: 204 });
    }
    if (pathname !== '/reserve') return new Response(null, { status: 404 });
    if (!/^[a-f0-9]{64}$/.test(user) || !Number.isSafeInteger(daily) || daily < 1 || daily > 50 ||
        !Number.isSafeInteger(perUser) || perUser < 1 || perUser > 10) return new Response(null, { status: 400 });

    const now = Date.now();
    const day = Math.floor(now / 86_400_000);
    // One SQLite transaction in one account-wide object serializes every reservation.
    const result = this.storage.transactionSync(() => {
      this.sql.exec('DELETE FROM attempts WHERE day < ? AND leaseUntil <= ?', day, now);
      if (this.sql.exec('SELECT id FROM attempts WHERE id = ?', id).toArray().length) return 'busy';
      const { active, userActive, total, own } = this.sql.exec(`SELECT
        count(CASE WHEN leaseUntil > ? THEN 1 END) AS active,
        count(CASE WHEN leaseUntil > ? AND user = ? THEN 1 END) AS userActive,
        count(CASE WHEN day = ? THEN 1 END) AS total,
        count(CASE WHEN day = ? AND user = ? THEN 1 END) AS own
        FROM attempts`, now, now, user, day, day, user).one();
      if (total >= daily) return 'budget';
      if (own >= perUser) return 'user_budget';
      if (active >= 2 || userActive > 0) return 'busy';
      this.sql.exec('INSERT INTO attempts VALUES (?, ?, ?, ?)', id, user, day, now + leaseMs);
      return 'ok';
    });
    // A quiet object also removes metadata after the daily window.
    await this.storage.setAlarm((day + 1) * 86_400_000 + leaseMs);
    return Response.json({ result });
  }

  async alarm() {
    const now = Date.now();
    this.sql.exec('DELETE FROM attempts WHERE day < ? AND leaseUntil <= ?', Math.floor(now / 86_400_000), now);
  }
}
