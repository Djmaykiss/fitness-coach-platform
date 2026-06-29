#!/usr/bin/env node
/**
 * Limpieza del entorno de desarrollo ANTES de arrancar Next (corre como `predev`).
 *
 * Resuelve el problema recurrente de procesos `next dev` huerfanos que dejan el
 * puerto 3000 ocupado y obligan a Next a saltar a otro puerto (o dejan
 * localhost:3000 caido):
 *
 *  1. Mata cualquier proceso que este ESCUCHANDO en el puerto objetivo (3000).
 *  2. Mata procesos `next dev` / `next-server` huerfanos (garantiza un solo
 *     servidor Next a la vez).
 *
 * Es cross-platform (Windows / macOS / Linux), sin dependencias, y "best-effort":
 * cualquier error se ignora para no impedir el arranque. NO toca la app.
 *
 * Uso: node scripts/free-port.mjs [puerto]   (por defecto 3000 o $PORT)
 */
import { execSync } from "node:child_process";

const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const isWin = process.platform === "win32";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

function killPid(pid) {
  if (!pid) return;
  if (isWin) run(`taskkill /F /T /PID ${pid}`);
  else run(`kill -9 ${pid}`);
}

/** PIDs que escuchan en el puerto indicado. */
function pidsOnPort(port) {
  const pids = new Set();
  if (isWin) {
    const out = run("netstat -ano -p tcp");
    for (const line of out.split(/\r?\n/)) {
      if (line.includes(`:${port} `) && /LISTENING/i.test(line)) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== "0") pids.add(pid);
      }
    }
  } else {
    run(`lsof -ti tcp:${port} -sTCP:LISTEN`)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((p) => pids.add(p));
  }
  return [...pids];
}

/** PIDs de servidores Next huerfanos (next dev / next-server). */
function nextPids() {
  const pids = new Set();
  if (isWin) {
    // Se excluye el propio powershell ($PID) para no auto-matarse: la consulta
    // contiene literalmente 'next dev'/'next-server' y se detectaria a si misma.
    const cmd =
      'powershell -NoProfile -Command "' +
      "Get-CimInstance Win32_Process | Where-Object { " +
      "($_.CommandLine -match 'next-server' -or $_.CommandLine -match 'next dev') " +
      "-and $_.ProcessId -ne $PID -and $_.Name -ne 'powershell.exe' } | " +
      'Select-Object -ExpandProperty ProcessId"';
    run(cmd)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((p) => pids.add(p));
  } else {
    run('pgrep -f "next dev"').split(/\s+/).filter(Boolean).forEach((p) => pids.add(p));
    run('pgrep -f "next-server"').split(/\s+/).filter(Boolean).forEach((p) => pids.add(p));
  }
  pids.delete(String(process.pid));
  return [...pids];
}

const portPids = pidsOnPort(PORT);
const orphanPids = nextPids();
const all = [...new Set([...portPids, ...orphanPids])];

if (all.length === 0) {
  console.log(`[dev] Puerto ${PORT} libre y sin procesos Next huerfanos. ✓`);
} else {
  console.log(
    `[dev] Limpiando ${all.length} proceso(s) — ` +
      `puerto ${PORT}: [${portPids.join(", ") || "-"}], ` +
      `next huerfanos: [${orphanPids.join(", ") || "-"}]`,
  );
  all.forEach(killPid);
  console.log(`[dev] Entorno limpio. Arrancando un unico servidor Next en ${PORT}.`);
}
