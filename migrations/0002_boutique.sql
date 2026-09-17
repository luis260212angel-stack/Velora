create table if not exists boutique_state (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists studio_lock (
  id                   text primary key,
  password_hash        text not null,
  session_token_hash   text,
  session_expires_at   timestamptz
);

create table if not exists page_visits (
  id           text primary key,
  visitor_key  text not null unique,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  views        integer not null default 1
);

create table if not exists boutique_counters (
  name   text primary key,
  count  integer not null default 0
);

create table if not exists order_intents (
  id              text primary key,
  cart_key        text not null,
  items           jsonb not null,
  total           integer not null,
  created_at      timestamptz not null default now(),
  hidden_applied  boolean not null default false
);
