import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { normalizeBoutique, SEED_STATE } from "@/lib/catalog";
import type { BoutiqueState, BoutiqueStats, OrderIntent, Product } from "@/lib/types";

const scryptAsync = promisify(scrypt);
const LOCK_ID = "main";
const STATE_ID = "main";
const COOKIE = "velora_studio";
const DEFAULT_PASSWORD = "velora";
const SESSION_MS = 12 * 60 * 60 * 1000;

type LockRow = {
  password_hash: string;
  session_token_hash: string | null;
  session_expires_at: string | Date | null;
};

type StateRow = { data: unknown };
type CountRow = { n: number };
type CounterRow = { count: number };
type IntentRow = {
  id: string;
  cart_key: string;
  items: unknown;
  total: number;
  created_at: string | Date;
  hidden_applied: boolean;
};

function json(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

function iso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : String(value);
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, 32)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const key = (await scryptAsync(password, salt, 32)) as Buffer;
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie() {
  return getCookie(COOKIE) ?? null;
}

function writeSessionCookie(token: string | null) {
  if (!token) {
    deleteCookie(COOKIE);
    return;
  }
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_MS / 1000),
  });
}

async function ensureSeed() {
  const sql = await getSql();
  const lock = await sql.query<LockRow>("select password_hash from studio_lock where id = $1", [
    LOCK_ID,
  ]);
  if (lock.length === 0) {
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);
    await sql.query("insert into studio_lock (id, password_hash) values ($1, $2)", [
      LOCK_ID,
      passwordHash,
    ]);
  }
  const state = await sql.query<StateRow>("select data from boutique_state where id = $1", [
    STATE_ID,
  ]);
  if (state.length === 0) {
    await sql.query("insert into boutique_state (id, data) values ($1, $2::jsonb)", [
      STATE_ID,
      JSON.stringify(SEED_STATE),
    ]);
  }
  await sql.query(
    "insert into boutique_counters (name, count) values ('cart_adds', 0) on conflict (name) do nothing",
  );
}

export async function loadBoutique(): Promise<BoutiqueState> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql.query<StateRow>("select data from boutique_state where id = $1", [
    STATE_ID,
  ]);
  return normalizeBoutique(json(rows[0]?.data));
}

export async function saveBoutiqueState(state: BoutiqueState) {
  const sql = await getSql();
  const next = normalizeBoutique(state);
  await sql.query(
    "update boutique_state set data = $2::jsonb, updated_at = now() where id = $1",
    [STATE_ID, JSON.stringify(next)],
  );
  return next;
}

export async function getStats(): Promise<BoutiqueStats> {
  await ensureSeed();
  const sql = await getSql();
  const visitors = await sql.query<CountRow>("select count(*)::int as n from page_visits");
  const views = await sql.query<CountRow>(
    "select coalesce(sum(views), 0)::int as n from page_visits",
  );
  const carts = await sql.query<CounterRow>(
    "select count from boutique_counters where name = 'cart_adds'",
  );
  const orders = await sql.query<CountRow>("select count(*)::int as n from order_intents");
  return {
    uniqueVisitors: visitors[0]?.n ?? 0,
    pageViews: views[0]?.n ?? 0,
    cartAdds: carts[0]?.count ?? 0,
    whatsappOrders: orders[0]?.n ?? 0,
  };
}

export async function listOrderIntents(): Promise<OrderIntent[]> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql.query<IntentRow>(
    "select id, cart_key, items, total, created_at, hidden_applied from order_intents order by created_at desc limit 40",
  );
  return rows.map((row) => ({
    id: row.id,
    cartKey: row.cart_key,
    items: (json(row.items) as OrderIntent["items"]) ?? [],
    total: Number(row.total) || 0,
    createdAt: iso(row.created_at),
    hiddenApplied: Boolean(row.hidden_applied),
  }));
}

export async function recordVisit(visitorKey: string) {
  if (!visitorKey || visitorKey.length > 80) return { ok: true };
  await ensureSeed();
  const sql = await getSql();
  await sql.query(
    `insert into page_visits (id, visitor_key)
     values ($1, $2)
     on conflict (visitor_key) do update
       set views = page_visits.views + 1, last_seen = now()`,
    [crypto.randomUUID(), visitorKey],
  );
  return { ok: true };
}

export async function recordCartAdd() {
  await ensureSeed();
  const sql = await getSql();
  await sql.query(
    "update boutique_counters set count = count + 1 where name = 'cart_adds'",
  );
  return { ok: true };
}

export async function recordOrderIntent(input: {
  cartKey: string;
  items: OrderIntent["items"];
  total: number;
}) {
  await ensureSeed();
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql.query(
    "insert into order_intents (id, cart_key, items, total) values ($1, $2, $3::jsonb, $4)",
    [id, input.cartKey.slice(0, 80), JSON.stringify(input.items), input.total],
  );
  return { ok: true, id };
}

export async function studioStatus() {
  await ensureSeed();
  const unlocked = await hasStudioSession();
  return { unlocked };
}

export async function hasStudioSession() {
  const token = readCookie();
  if (!token) return false;
  const sql = await getSql();
  const rows = await sql.query<LockRow>(
    "select session_token_hash, session_expires_at from studio_lock where id = $1",
    [LOCK_ID],
  );
  const row = rows[0];
  if (!row?.session_token_hash || !row.session_expires_at) return false;
  const expires = new Date(row.session_expires_at).getTime();
  if (Number.isNaN(expires) || expires < Date.now()) return false;
  const incoming = Buffer.from(tokenHash(token), "hex");
  const stored = Buffer.from(row.session_token_hash, "hex");
  if (incoming.length !== stored.length) return false;
  return timingSafeEqual(incoming, stored);
}

export async function unlockStudio(password: string) {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql.query<LockRow>("select password_hash from studio_lock where id = $1", [
    LOCK_ID,
  ]);
  const stored = rows[0]?.password_hash ?? (await hashPassword("missing"));
  const ok = await verifyPassword(password, stored);
  if (!ok || !rows[0]) {
    return { ok: false as const };
  }
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + SESSION_MS).toISOString();
  await sql.query(
    "update studio_lock set session_token_hash = $2, session_expires_at = $3 where id = $1",
    [LOCK_ID, tokenHash(token), expires],
  );
  writeSessionCookie(token);
  return { ok: true as const };
}

export async function lockStudio() {
  await ensureSeed();
  const sql = await getSql();
  await sql.query(
    "update studio_lock set session_token_hash = null, session_expires_at = null where id = $1",
    [LOCK_ID],
  );
  writeSessionCookie(null);
  return { ok: true };
}

export async function requireStudio() {
  if (!(await hasStudioSession())) {
    throw new Error("El estudio está cerrado");
  }
}

export async function changePassword(current: string, next: string) {
  await requireStudio();
  const sql = await getSql();
  const rows = await sql.query<LockRow>("select password_hash from studio_lock where id = $1", [
    LOCK_ID,
  ]);
  const stored = rows[0]?.password_hash;
  if (!stored || !(await verifyPassword(current, stored))) {
    return { ok: false as const, message: "La contraseña actual no coincide" };
  }
  if (next.trim().length < 4) {
    return { ok: false as const, message: "La nueva contraseña necesita al menos 4 caracteres" };
  }
  const passwordHash = await hashPassword(next.trim());
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + SESSION_MS).toISOString();
  await sql.query(
    "update studio_lock set password_hash = $2, session_token_hash = $3, session_expires_at = $4 where id = $1",
    [LOCK_ID, passwordHash, tokenHash(token), expires],
  );
  writeSessionCookie(token);
  return { ok: true as const };
}

export async function hideProducts(ids: string[]) {
  await requireStudio();
  const state = await loadBoutique();
  const set = new Set(ids);
  const products: Product[] = state.products.map((product) =>
    set.has(product.id) ? { ...product, hidden: true } : product,
  );
  const next = await saveBoutiqueState({ ...state, products });
  return next;
}

export async function markIntentHidden(id: string) {
  await requireStudio();
  const sql = await getSql();
  await sql.query("update order_intents set hidden_applied = true where id = $1", [id]);
  return { ok: true };
}
