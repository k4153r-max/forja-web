CREATE TABLE IF NOT EXISTS contactos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  empresa TEXT,
  rubro TEXT,
  producto TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  turnstile_ok INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nuevo',
  notify_ok INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_contactos_created ON contactos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_status ON contactos(status);
CREATE INDEX IF NOT EXISTS idx_contactos_ip_hour ON contactos(ip_hash, created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT NOT NULL,
  window_start TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip_hash, window_start)
);

CREATE TABLE IF NOT EXISTS visitas_dia (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  uniques INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
CREATE INDEX IF NOT EXISTS idx_visitas_dia_hits ON visitas_dia(hits DESC);

CREATE TABLE IF NOT EXISTS visitas_visto (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  visitor TEXT NOT NULL,
  PRIMARY KEY (day, path, visitor)
);

CREATE TABLE IF NOT EXISTS visitas_libro (
  book_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (book_id, kind)
);
